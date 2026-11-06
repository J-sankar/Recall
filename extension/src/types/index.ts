export interface CaptureResourceMessage {
    type: "CAPTURE_RESOURCE",
    payload: {
        url: string,
        title: string
    }
}

export interface CaptureResponse {
    success: boolean;
    message: string;
}

export type ExtensionMessage =
    | {
        type: "PING";
    }
    | CaptureResourceMessage;