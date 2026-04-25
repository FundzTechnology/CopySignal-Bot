declare class TelegramListener {
    private client;
    private activeChannels;
    constructor();
    connect(): Promise<void>;
    addChannel(channelIdentifier: string, onMessage: (msg: string, msgId: string) => void): void;
    removeChannel(channelIdentifier: string): void;
    getActiveChannels(): string[];
}
export declare const telegramListener: TelegramListener;
export {};
//# sourceMappingURL=telegramListener.d.ts.map