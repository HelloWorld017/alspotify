const deepmerge = require('deepmerge');
const { width, height } = require("screenz");
const fs = require('fs');
const observable = require('./Observable');

class Config {
	constructor() {
		this.config = {};
		this.initialized = false;
		this.observable = null;
	}

	init() {
		if(this.initialized) return;

		try {
			const configRaw = fs.readFileSync('./config.json', 'utf8');
			this.config = deepmerge(
				this.defaultConfig,
				JSON.parse(configRaw),
				{ arrayMerge: (d, s, o) => s }
			);
		} catch(e) {
			this.config = this.defaultConfig;
			this.save();
		}

		this.observable = observable.init('config', this.config);
		this.initialized = true;
	}

	save() {
		fs.writeFileSync('./config.json', JSON.stringify(this.config, null, '\t'));
	}

	get defaultConfig() {

		return {
			style: {
				font: 'KoPubWorldDotum',
				nowPlaying: {
					color: '#FFFFFF',
					background: 'rgba(29, 29, 29, .50)',
					backgroundProgress: 'rgba(29, 29, 29, .80)',
					fontSize: 11,
					width: 300
				},

				lyric: {
					color: '#FFFFFF',
					background: 'rgba(29, 29, 29, .70)',
					fontSize: 12,
					width: 500,
					height: 150,
					align: 'right'
				}
			},

			lyric: {
				count: 3,
				overflow: 'none' // 'elide' or 'wrap' or 'none'
			},

			windowPosition: {
				x: width - 600,
				y: height - 250,
				w: 500,
				h: 150
			}
		};
	}
}

const config = new Config();

module.exports = () => {
	config.init();
	return config.observable;
};
