class Store {
	constructor() {
		this.store = {};
		this.watching = [];
	}
	
	set(newStore) {
		const oldStore = this.store;
		this.store = newStore;
		
		const updateKey = Object.keys(newStore).filter(key => newStore[key] !== oldStore[key]);
		this.propagate(updateKey);
	}
	
	propagate(updateKey) {
		if(typeof updateKey === 'string')
			updateKey = [ updateKey ];

		this.watching.forEach(widget => {
			widget.update(updateKey, this.store);
		});
	}
	
	watch(widget) {
		this.watching.push(widget);
	}
}

const store = new Store();
module.exports = store;