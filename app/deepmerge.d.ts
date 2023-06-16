declare function deepmerge<T>(x: Partial<T>, y: Partial<T>, options?: deepmerge.Options<T, T>): T;
declare function deepmerge<T1, T2>(x: Partial<T1>, y: Partial<T2>, options?: deepmerge.Options<T1, T2>): T1 & T2;

declare namespace deepmerge {
  export interface Options<T, S> {
    arrayMerge?: (target: T[], source: S[], options?: ArrayMergeOptions<T, S>) => (T | S)[];
    clone?: boolean;
    customMerge?: (key: string, options?: Options<T, S>) => ((x: T, y: S) => T | S) | undefined;
    isMergeableObject?(value: object): boolean;
  }
  export interface ArrayMergeOptions<T, S> {
    isMergeableObject(value: object): boolean;
    cloneUnlessOtherwiseSpecified(value: object, options?: Options<T, S>): object;
  }

  export function all (objects: object[], options?: Options<object, object>): object;
}
