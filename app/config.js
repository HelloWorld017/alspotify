const deepmerge = require('deepmerge');
const displays = require('displays')();
const fs = require('fs');

class Config {
	constructor() {
		this.config = {};
		this.initialized = false;;
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

		this.initialized = true;
	}

	save() {
		fs.writeFileSync('./config.json', JSON.stringify(this.config, null, '\t'));
	}

	get defaultConfig() {
		const lastDisplay = displays[displays.length - 1];

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
				count: 3
			},

			windowPosition: {
				x: lastDisplay.left + lastDisplay.width - 600,
				y: lastDisplay.top + lastDisplay.height - 250,
				w: 500,
				h: 150
			}
		};
	}
}

const config = new Config();
module.exports = () => {
	config.init();
	return config.config;
};
