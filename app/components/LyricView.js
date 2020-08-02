const alsong = require('alsong');
const config = require('../config')();
const store = require('../store');

const {
	Direction,
	QBoxLayout,
	QFont,
	QLabel,
	QRect,
	QWidget
} = require("@nodegui/nodegui");

const {
	QFontMetrics
} = require("nodegui-plugin-metrics");

class LyricView {
	constructor() {
		const layout = new QBoxLayout(Direction.TopToBottom);

		const lyric = new QWidget();
		lyric.setObjectName("Lyric");
		lyric.setLayout(layout);
		lyric.setStyleSheet(`
			#Lyric {
				width: ${config.style.lyric.width}px;
				height: ${config.style.lyric.height}px;
				margin-bottom: 20px;
			}

			#Lyric QLabel {
				color: ${config.style.lyric.color};
				background: ${config.style.lyric.background};
				padding: 2px 5px;
				margin: 1px 0;
			}
		`);

		const font = new QFont(config.style.font, config.style.lyric.fontSize);
		const labels = [];
		for(let i = 0; i < config.lyric.count; i++) {
			const label = new QLabel();
			label.setFont(font);

			const labelLayout = new QBoxLayout(Direction.RightToLeft);
			layout.addLayout(labelLayout)
			switch(config.style.lyric.align) {
				case 'left':
					labelLayout.addStretch(1);
					labelLayout.addWidget(label);
					break;

				case 'right':
					labelLayout.addWidget(label);
					labelLayout.addStretch(1);
					break;

				case 'center':
					labelLayout.addWidget(label);
			}
			labels.push(label);
		}
		this.metrics = new QFontMetrics(font);
		this.labels = labels;

		this.widget = lyric;
		store.watch(this);

		this.lastUpdate = -1;
		this.fetched = {
			timestamp: [],
			lyric: {}
		};
	}

	async fetchLyric(artist, title) {
		try {
			const lyrics = await alsong(artist, title);
			if(lyrics.length === 0) {
				this.fetched = {
					timestamp: [],
					lyric: {}
				};
				return;
			}

			//TODO change fetch algorithm, ex) 마지막 lyric이 duration보다 짧은 것 중 최대한 긴 것
			const lyric = lyrics[0].lyric;

			const timestamp = Object.keys(lyric).sort((v1, v2) => parseInt(v1) - parseInt(v2));
			this.fetched = {
				timestamp,
				lyric
			};
			this.lastUpdate = -1;

			console.log(`Retrieved lyric: ${artist} - ${title}`);
		} catch(e) {
			console.error(e);
			return;
		}
	}

	getWidget() {
		return this.widget;
	}

	async update(key, item) {
		if(key.includes('title') || key.includes('artist')) {
			await this.fetchLyric(item.artist, item.title);
		}

		if(key.includes('progress')) {
			let i = 0;
			for(; i < this.fetched.timestamp.length; i++) {
				if(i + 1 >= this.fetched.timestamp.length)
					continue;

				if(this.fetched.timestamp[i + 1] > item.progress)
					break;
			}

			if(this.lastUpdate !== i) {
				const currentLyric = (this.fetched.lyric[this.fetched.timestamp[i]] || []).slice();
				while(this.labels.length > currentLyric.length) {
					currentLyric.unshift('');
				}

				for(let j = 0; j < this.labels.length; j++) {
					if(currentLyric[j]) {
						if(!this.labels[j].isVisible())
							this.labels[j].show();

						const geometry = this.labels[j].geometry();
						const boundingRect = this.metrics.boundingRect(currentLyric[j]);
						const elideWidth = config.style.lyric.width;

						if(boundingRect.width() + 20 < elideWidth) {
							this.labels[j].setFixedSize(boundingRect.width() + 20, boundingRect.height() + 10);
							this.labels[j].setText(currentLyric[j]);
						} else {

						}
					} else {
						if(this.labels[j].isVisible()) {
							this.labels[j].setText('');
							this.labels[j].hide();
						}
					}
				}

				this.lastUpdate = i;
			}
		}
	}
}

module.exports = LyricView;
