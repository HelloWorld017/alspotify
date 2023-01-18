type Effect = () => void;
type ObserverBase = {
  '#': Set<Effect>,
  '#Parent': ObserverBase,
  [x: string | symbol]: Set<Effect> | ObserverBase,
};

export type ObserverPrototype<T = unknown> = {
  $observe(effect: Effect): void;
  $assign(target: T): (value: Record<string, unknown> & T) => void;
  $set(target: T): (value: Record<string, unknown> & T) => void;
};


class Observable {
  public readonly observers: ObserverBase;
  public readonly currentObserver: Effect[];

  constructor() {
    this.observers = this.createNewObserver(null);
    this.currentObserver = [];
  }

  init(name: string, hookTarget: object) {
    if (!this.observers[name])
      {this.observers[name] = this.createNewObserver(this.observers);}

    return this.hookProperty(hookTarget, this.observers[name] as ObserverBase);
  }

  createNewObserver(parent: ObserverBase): ObserverBase {
    return Object.assign(Object.create(null), {
      '#': new Set(),
      '#Parent': parent
    }) as ObserverBase;
  }

  createNewPrototype(observers: ObserverBase): ObserverPrototype {
    return {
      $observe: () => this.observe.bind(this) as Effect,

      $set: (target: Effect) => {
        return value => {
          for (const key in target) {
            delete target[key];
          }

          for (const key in value) {
            target[key] = value[key];
          }

          this.callObservers(observers);
        };
      },

      $assign: target => {
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

  hookProperty(hookTarget: object, observers = this.observers): object {
    if (Array.isArray(hookTarget)) {
      // Don't hook array, for purpose of performance
      return hookTarget as Array<unknown>;
    }

    const prototype = this.createNewPrototype(observers);
    return new Proxy(hookTarget, {
      get: (target, name) => {
        if (Object.hasOwnProperty.call(prototype, name) && typeof prototype[name] === 'function') {
          return (prototype[name] as (target) => (value) => void)(target);
        }

        if (!observers[name])
          {observers[name] = this.createNewObserver(observers);}

        if (this.currentObserver.length > 0) {
          const currentObserver = this.currentObserver[this.currentObserver.length - 1];

          if (!(observers[name] as ObserverBase)['#'].has(currentObserver)) {
            let observerList = observers[name] as ObserverBase;

            while (observerList !== null) {
              observerList['#'].add(currentObserver);
              observerList = observerList['#Parent'];
            }
          }
        }

        const targetItem = target[name] as object;

        if (typeof targetItem === 'object')
          {return this.hookProperty(targetItem, observers[name] as ObserverBase);}

        return targetItem;
      },

      set: (target: object, name: string | symbol, value: object) => {
        target[name] = value;

        if (observers[name])
          {this.callObservers(observers[name] as ObserverBase);}

        return true;
      }
    });
  }

  observe(fn: Effect) {
    this.currentObserver.push(fn);
    fn();
    this.currentObserver.pop();
  }
}

const observable = new Observable();
export default observable;
