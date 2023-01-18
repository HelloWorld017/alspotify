interface ConfigStruct {
    style: {
        font: string;
        nowPlaying: {
            color: string;
            background: string;
            backgroundProgress: string;
            fontSize: number;
            width: number;
        };
        lyric: {
            color: string;
            background: string;
            fontSize: number;
            width: number;
            height: number;
            align: string;
        };
    };
    lyric: {
        count: number;
        overflow: string;
    };
    windowPosition: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
}
declare const _default: () => ConfigStruct & {
    readonly observers: any;
    readonly currentObserver: any[];
    readonly $observe: (callbackFn: () => void) => void;
    readonly $assign: (obj: any) => void;
    readonly $set: (target: any) => (value: any) => void;
    init(name: any, hookTarget: any): any;
    createNewObserver(parent: any): any;
    createNewPrototype(observers: any): {
        $observe: () => any;
        $set: (target: any) => (value: any) => void;
        $assign: (target: any) => (value: any) => void;
    };
    callObservers(observers: any): void;
    hookProperty(hookTarget: any, observers?: any): any;
    observe(fn: any): void;
};
export default _default;
