class Observable {
	constructor() {
		this.observers = this.createNewObserver(null);
		this.currentObserver = [];
	}

	init(name, hookTarget) {
		if(!this.observers[name])
			this.observers[name] = this.createNewObserver(this.observers);

		return this.hookProperty(hookTarget, this.observers[name]);
	}

	createNewObserver(parent) {
		return Object.assign(Object.create(null), {
			'#': new Set(),
			'#Parent': parent
		});
	}

	createNewPrototype(observers) {
		return {
			$observe: () => this.observe.bind(this),

			$set: target => {
				return value => {
					for(const key in target) {
						delete target[key];
					}

					for(const key in value) {
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
			this.observe(observer);
		});
	}

	hookProperty(hookTarget, observers = this.observers) {
		if(Array.isArray(hookTarget)) {
			// Don't hook array, for purpose of performance
			return hookTarget;
		}

		const prototype = this.createNewPrototype(observers);
		return new Proxy(hookTarget, {
			get: (target, name) => {
				if(prototype.hasOwnProperty(name))
					return prototype[name](target);

				if(!observers[name])
					observers[name] = this.createNewObserver(observers);

				if(this.currentObserver.length > 0) {
					const currentObserver = this.currentObserver[this.currentObserver.length - 1];

					if(!observers[name]['#'].has(currentObserver)) {
						let observerList = observers[name];

						while(observerList !== null) {
							observerList['#'].add(currentObserver);
							observerList = observerList['#Parent'];
						}
					}
				}

				const targetItem = target[name];
				if(typeof targetItem === 'object')
					return this.hookProperty(targetItem, observers[name]);

				return targetItem;
			},

			set: (target, name, value) => {
				target[name] = value;

				if(observers[name])
					this.callObservers(observers[name]);

				return true;
			}
		});
	}

	observe(fn) {
		this.currentObserver.push(fn);
		fn();
		this.currentObserver.pop();
	}
}

const observable = new Observable();
module.exports = observable;
