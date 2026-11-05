import dns from "node:dns";

interface LinkMetadata {
	title: string | null;
	description: string | null;
	image: string | null;
	favicon: string | null;
	site_name: string | null;
	final_url: string;
}
const MAX_HTML_SIZE = 1 * 1024 * 1024;
const MAX_REDIRECTS = 5;

interface Env {
	RECALL_WORKER_SECRET: string;
}


function isUnsafeHostname(hostname: string): boolean {
	const normalized = hostname.toLowerCase().replace(/\.$/, "");

	// Remove brackets around IPv6 addresses.
	const unwrapped = normalized.replace(/^\[|\]$/g, "");

	// Reject raw IPv4 addresses.
	const isIPv4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(unwrapped);

	// Reject raw IPv6 addresses.
	const isIPv6 = unwrapped.includes(":");

	// Reject local hostnames.
	const isLocalHostname =
		normalized === "localhost" ||
		normalized.endsWith(".localhost") ||
		normalized.endsWith(".local") ||
		normalized.endsWith(".internal");

	return isIPv4 || isIPv6 || isLocalHostname;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {

		// Authenticate the backend request.
		const providedSecret = request.headers.get("X-Recall-Worker-Secret");

		if (!providedSecret || providedSecret !== env.RECALL_WORKER_SECRET) {
			return Response.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// 1. Validate HTTP method
		if (request.method !== "POST") {
			return Response.json(
				{ error: "Method not allowed" },
				{ status: 405 }
			);
		}

		// 2. Parse request body
		let body: { url?: string };

		try {
			body = await request.json();
		} catch {
			return Response.json(
				{ error: "Invalid JSON body" },
				{ status: 400 }
			);
		}

		if (!body.url || typeof body.url !== "string") {
			return Response.json(
				{ error: "URL is required" },
				{ status: 400 }
			);
		}

		// 3. Validate and normalize URL
		let targetUrl: URL;

		try {
			targetUrl = new URL(body.url);

			if (!["http:", "https:"].includes(targetUrl.protocol)) {
				throw new Error("Unsupported protocol");
			}

			if (!targetUrl.hostname || isUnsafeHostname(targetUrl.hostname)) {
				throw new Error("Unsafe hostname");
			}

			// Credentials are unnecessary for public link previews.
			if (targetUrl.username || targetUrl.password) {
				throw new Error("URL credentials are not allowed");
			}

			// Normalize the URL.
			targetUrl.hash = "";

		} catch {
			return Response.json(
				{ error: "Invalid or unsafe URL" },
				{ status: 400 }
			);
		}

		// 4. Prepare fetch cancellation
		const controller = new AbortController();
		const timeoutSignal = AbortSignal.timeout(10_000);

		const signal = AbortSignal.any([
			controller.signal,
			timeoutSignal,
		]);

		try {
			// 5. Fetch webpage and validate redirects
			let currentUrl = targetUrl;
			let response: Response;

			for (let redirectCount = 0; ; redirectCount++) {
				response = await fetch(currentUrl.href, {
					headers: {
						"User-Agent":
							"RecallBot/1.0 (+https://github.com/J-sankar/Recall)",
						"Accept": "text/html",
					},
					redirect: "manual",
					signal,
				});

				const isRedirect = [301, 302, 303, 307, 308].includes(
					response.status
				);

				if (!isRedirect) break;

				const location = response.headers.get("location");

				if (!location || redirectCount >= MAX_REDIRECTS) {
					await response.body?.cancel();

					return Response.json(
						{ error: "Invalid or excessive redirects" },
						{ status: 502 }
					);
				}

				let nextUrl: URL;

				try {
					nextUrl = new URL(location, currentUrl);

					if (
						!["http:", "https:"].includes(nextUrl.protocol) ||
						isUnsafeHostname(nextUrl.hostname) ||
						nextUrl.username ||
						nextUrl.password
					) {
						throw new Error("Unsafe redirect destination");
					}

					nextUrl.hash = "";
				} catch {
					await response.body?.cancel();

					return Response.json(
						{ error: "Unsafe redirect destination" },
						{ status: 502 }
					);
				}

				// Discard the redirect response body.
				await response.body?.cancel();

				// Follow the validated destination.
				currentUrl = nextUrl;
			}

			if (!response.ok) {
				return Response.json(
					{ error: "Failed to fetch webpage" },
					{ status: 502 }
				);
			}

			// 6. Ensure the response is HTML
			const contentType =
				response.headers.get("content-type")?.toLowerCase() ?? "";

			if (!contentType.includes("text/html")) {
				return Response.json(
					{ error: "URL does not point to an HTML page" },
					{ status: 415 }
				);
			}

			// 7. Prepare metadata fields
			let pageTitle = "";
			let ogTitle = "";
			let description = "";
			let ogDescription = "";
			let image = "";
			let siteName = "";
			let favicon = "";

			let headFinished = false;

			// 8. Configure HTMLRewriter
			const rewriter = new HTMLRewriter()
				.on("title", {
					text(chunk) {
						pageTitle += chunk.text;
					},
				})

				.on("meta", {
					element(element) {
						const name =
							element.getAttribute("name")?.toLowerCase();

						const property =
							element.getAttribute("property")?.toLowerCase();

						const content =
							element.getAttribute("content");

						if (!content) return;

						if (name === "description") {
							description = content;
						} else if (property === "og:title") {
							ogTitle = content;
						} else if (property === "og:description") {
							ogDescription = content;
						} else if (property === "og:image") {
							image = content;
						} else if (property === "og:site_name") {
							siteName = content;
						}
					},
				})

				.on("link", {
					element(element) {
						const rel =
							element.getAttribute("rel")?.toLowerCase() ?? "";

						if (
							rel.split(/\s+/).includes("icon") ||
							rel === "apple-touch-icon"
						) {
							const href = element.getAttribute("href");

							if (href && !href.startsWith("data:")) {
								favicon = href;
							}
						}
					},
				})

				// 9. Detect the closing head tag
				.on("head", {
					element(element) {
						element.onEndTag(() => {
							headFinished = true;
						});
					},
				})

			// 10. Transform the response
			const transformedResponse = rewriter.transform(response);

			const reader = transformedResponse.body?.getReader();

			if (!reader) {
				controller.abort();

				return Response.json(
					{ error: "Unable to read webpage" },
					{ status: 502 }
				);
			}

			let totalBytes = 0;
			let exceededSizeLimit = false;

			try {
				while (!headFinished) {
					const { done, value } = await reader.read();

					if (done) break;

					if (value) {
						totalBytes += value.byteLength;

						if (totalBytes > MAX_HTML_SIZE) {
							exceededSizeLimit = true;
							break;
						}
					}
				}

				if (headFinished || exceededSizeLimit) {
					try {
						await reader.cancel();
					} catch {
						// Ignore cancellation errors.
					} finally {
						controller.abort();
					}
				}
			} finally {
				reader.releaseLock();
			}

			if (exceededSizeLimit) {
				return Response.json(
					{ error: "Webpage exceeds the maximum allowed size" },
					{ status: 413 }
				);
			}

			// 12. Resolve relative URLs
			const finalUrl = currentUrl.href;

			const resolveUrl = (value: string): string | null => {
				if (!value) return null;

				try {
					const resolved = new URL(value, finalUrl);

					if (!["http:", "https:"].includes(resolved.protocol)) {
						return null;
					}

					return resolved.href;
				} catch {
					return null;
				}
			};

			// 13. Construct metadata response
			const metadata: LinkMetadata = {
				title: ogTitle || pageTitle.trim() || null,
				description: ogDescription || description || null,
				image: resolveUrl(image),
				favicon: resolveUrl(favicon),
				site_name: siteName || null,
				final_url: finalUrl,
			};

			return Response.json(metadata);

		} catch {
			controller.abort();

			return Response.json(
				{ error: "Unable to fetch webpage" },
				{ status: 502 }
			);
		}
	},
} satisfies ExportedHandler<Env>;
