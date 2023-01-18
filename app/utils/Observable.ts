/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call */
class Observable {
  public readonly observers: any[];
  public readonly currentObserver: any[];
  public readonly $observe: (callbackFn: () => void) => void;
  public readonly $assign: (target: any) => (value: any) => void;
  public readonly $set: (target: any) => (value: any) => void;

  constructor() {
    this.observers = this.createNewObserver(null);
    this.currentObserver = [];
  }

  init(name: string, hookTarget: object) {
    if (!this.observers[name])
      {this.observers[name] = this.createNewObserver(this.observers);}

    return this.hookProperty(hookTarget, this.observers[name] as any[]);
  }

  createNewObserver(parent): any[] {
    return Object.assign(Object.create(null), {
      '#': new Set(),
      '#Parent': parent
    });
  }

  createNewPrototype(observers): {
    $assign: (target) => (value) => void;
    $observe: (callbackFn: () => void) => void;
    $set: (target) => (value) => void
  } {
    return {
      $observe: () => this.observe.bind(this),

      $set: target => {
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

  callObservers(observers) {
    observers['#'].forEach(observer => {
      this.observe(observer as () => void);
    });
  }

  hookProperty(hookTarget: object, observers = this.observers) {
    if (Array.isArray(hookTarget)) {
      // Don't hook array, for purpose of performance
      return hookTarget;
    }

    const prototype = this.createNewPrototype(observers);
    return new Proxy(hookTarget, {
      get: (target, name) => {
        if (Object.hasOwnProperty.call(prototype, name))
          {return prototype[name](target);}

        if (!observers[name])
          {observers[name] = this.createNewObserver(observers);}

        if (this.currentObserver.length > 0) {
          const currentObserver = this.currentObserver[this.currentObserver.length - 1];

          if (!observers[name]['#'].has(currentObserver)) {
            let observerList = observers[name];

            while (observerList !== null) {
              observerList['#'].add(currentObserver);
              observerList = observerList['#Parent'];
            }
          }
        }

        const targetItem = target[name];
        if (typeof targetItem === 'object')
          {return this.hookProperty(targetItem as object, observers[name] as any[]);}

        return targetItem;
      },

      set: (target: object, name: string | symbol, value) => {
        target[name] = value;

        if (observers[name])
          {this.callObservers(observers[name]);}

        return true;
      }
    });
  }

  observe(fn: () => void) {
    this.currentObserver.push(fn);
    fn();
    this.currentObserver.pop();
  }
}

const observable = new Observable();
export default observable;
