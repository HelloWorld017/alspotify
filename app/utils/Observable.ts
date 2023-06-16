type Effect = () => void;
export type Observer<T> = ObserverBase & ObserverPrototype<T> & T;
type ObserverBase = {
  '#': Set<Effect>,
  '#Parent': ObserverBase,
  [x: string | symbol]: Set<Effect> | ObserverBase,
};

type ObserverPrototype<T = unknown> = {
  $observe(effect: Effect): void;
  $assign(value: Record<string, unknown> & T): void;
  $set(value: Record<string, unknown> & T): void;
};

type ObserverPrototypeGenerator<T = unknown> = {
  $observe(target: T): ObserverPrototype<T>['$observe'];
  $assign(target: T): ObserverPrototype<T>['$assign'];
  $set(target: T): ObserverPrototype<T>['$set'];
};

class Observable {
  public readonly observers: ObserverBase;
  public readonly currentObserver: Effect[];

  constructor() {
    this.observers = this.createNewObserver(null);
    this.currentObserver = [];
  }

  init<T extends object>(name: string, hookTarget: T): Observer<T> {
    if (!this.observers[name])
    {this.observers[name] = this.createNewObserver(this.observers);}

    return this.hookProperty<T>(hookTarget, this.observers[name] as ObserverBase);
  }

  createNewObserver(parent: ObserverBase): ObserverBase {
    return Object.assign(Object.create(null), {
      '#': new Set(),
      '#Parent': parent
    }) as ObserverBase;
  }

  createNewPrototype<T extends object>(observers: ObserverBase): ObserverPrototypeGenerator<T> {
    return {
      $observe: () => void this.observe.bind(this),

      $set: (target) => {
        return (value) => {
          for (const key in target) {
            delete target[key];
          }

          for (const key in value) {
            target[key] = value[key];
          }

          this.callObservers(observers);
        };
      },

      $assign: (target) => {
        return value => {
          Object.assign(target, value);
          this.callObservers(observers);
        };
      }
    };
  }

  callObservers(observers: ObserverBase) {
    observers['#'].forEach(observer => {
      this.observe(observer);
    });
  }

  hookProperty<T extends object>(hookTarget: T, observers = this.observers): Observer<T> {
    if (Array.isArray(hookTarget)) {
      // Don't hook array, for purpose of performance
      return hookTarget as Observer<T>;
    }

    const prototype = this.createNewPrototype(observers);
    const isPrototypeKey = (key: string | symbol): key is keyof ObserverPrototype =>
      (Object.hasOwnProperty.call(prototype, key) as boolean);

    return new Proxy<T>(hookTarget, {
      get: (target, name) => {
        if (isPrototypeKey(name) && typeof prototype[name] === 'function') {
          return prototype[name](target);
        }

        if (!observers[name]) {
          observers[name] = this.createNewObserver(observers);
        }

        let observerList = observers[name] as ObserverBase;
        if (this.currentObserver.length > 0) {
          const currentObserver = this.currentObserver[this.currentObserver.length - 1];

          if (!observerList['#'].has(currentObserver)) {
            while (observerList !== null) {
              observerList['#'].add(currentObserver);
              observerList = observerList['#Parent'];
            }
          }
        }

        const targetItem = target[name as keyof T];
        if (typeof targetItem === 'object') {
          return this.hookProperty(targetItem as object, observers[name] as ObserverBase);
        }

        return targetItem;
      },

      set: (target: T, name: string | symbol, value: object) => {
        target[name as keyof T] = value as T[keyof T];

        if (observers[name]) {
          this.callObservers(observers[name] as ObserverBase);
        }

        return true;
      }
    }) as Observer<T>;
  }

  observe(fn: Effect) {
    this.currentObserver.push(fn);
    fn();
    this.currentObserver.pop();
  }
}

const observable = new Observable();
export default observable;
