import observable from './utils/Observable';
declare class Alspotify {
    info: {
        playing: boolean;
        title: string;
        artist: string;
        progress: number;
        duration: number;
        lyric: {
            timestamp: string[];
            lyric: {
                [key: string]: string[];
            };
            current?: string[];
        };
    } & typeof observable;
    private lastUri;
    private lastUpdate;
    private app;
    private initialized;
    constructor();
    init(): void;
    tick(): void;
    update(body: any): Promise<void>;
    updateLyric(spotifyLyric: any): Promise<void>;
    updateProgress(): void;
}
declare const _default: () => Alspotify;
export default _default;
