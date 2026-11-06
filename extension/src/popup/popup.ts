import type {
    CaptureResourceMessage,
    CaptureResponse
} from "../types/index"

const titleElement = document.getElementById(
    "page-title"
) as HTMLHeadingElement;

const urlElement = document.getElementById(
    "page-url"
) as HTMLParagraphElement;

const saveBtn = document.getElementById("save-button") as HTMLButtonElement;



saveBtn.addEventListener("click", async () => {
    try {
        saveBtn.disabled = true;

        const message: CaptureResourceMessage = {
            type: "CAPTURE_RESOURCE",
            payload: {
                url: urlElement.textContent?.trim() ?? "",
                title: titleElement.textContent?.trim() ?? ""
            }
        };

        const response: CaptureResponse =
            await chrome.runtime.sendMessage(message);

        console.log(response.message);

    } catch (error) {
        console.error("Failed to save resource:", error);
    } finally {
        saveBtn.disabled = false;
    }
});
async function getCurrentTab(): Promise<void> {
    try {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        titleElement.textContent = tab.title ?? "Untitled page";
        urlElement.textContent = tab.url ?? "URL unavailable";

    } catch (error) {
        console.error("Failed to retrieve active tab:", error);
        titleElement.textContent = "Unable to retrieve page";
    }
}

getCurrentTab();



async function testBackground(): Promise<void> {
    const response = await chrome.runtime.sendMessage({
        type: "PING"
    });

    console.log(response);

}

testBackground();