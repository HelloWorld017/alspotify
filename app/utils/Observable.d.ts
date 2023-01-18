declare class Observable {
    readonly observers: any;
    readonly currentObserver: any[];
    readonly $observe: (callbackFn: () => void) => void;
    readonly $assign: (obj: any) => void;
    readonly $set: (target: any) => (value: any) => void;
    constructor();
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
}
declare const observable: Observable;
export default observable;
