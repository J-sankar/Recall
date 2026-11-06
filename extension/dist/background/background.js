chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "PING") {
        sendResponse({
            success: true,
            message: "hello from background worker"
        });
    }
    if (message.type == "CAPTURE_RESOURCE") {
        const { url, title } = message.payload;
        console.log("Received resource:", {
            url,
            title
        });
        sendResponse({
            success: true,
            message: "Resource received successfully!"
        });
    }
    return true;
});
export {};
