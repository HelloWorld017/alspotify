const alsong = require('alsong');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./utils/Config')();
const express = require('express');
const observable = require('./utils/Observable');

const { QApplication } = require("@nodegui/nodegui");


class Alspotify {
	constructor() {
		this.info = observable.init('api', {});
		this.lastUri = null;
		this.lastUpdate = -1;
		this.lastFetch = -1;
		this.titleRegex = /(?:[\[\(\{\【]([^\]\)\}\】]+)[\]\)\}\】]\s*)*([^\[\(\{\【\「\]\)\}\】\」\-\/]+)(?:[\[\(\{\【]([^\]\)\}\】]+)[\]\)\}\】]\s*)*/g;

		const app = express();
		app.use(cors());
		app.use(bodyParser.json());

		app.post('/', (req, res) => {
			this.update(req.body);
			res.end();
		});

		app.get('/config', (req, res) => {

		});

		app.post('/config', (req, res) => {

		});

		app.post('/shutdown', (req, res) => {
			const qApp = QApplication.instance();
			qApp.quit();
		});

		this.app = app;
		this.initialized = false;
	}

	init() {
		if(this.initialized)
			return;

		this.initialized = true;
		this.app.listen(1608, 'localhost');
		this.info.$observe(() => {
			this.updateProgress();
		});
		setInterval(() => this.tick(), 50);
	}

	tick() {
		if(this.info.playing) {
			this.info.progress = Math.min(
				this.info.duration,
				this.info.progress + 50
			);
		}
	}

	async update(body) {
		if(!body.data || body.data.status !== 'playing') {
			this.info.playing = false;
			return;
		}

		if(
			typeof body.data.progress !== 'number' ||
			!isFinite(body.data.progress) ||
			body.data.progress < 0 ||
			body.data.progress > body.data.duration
		)
			return;

		body.data.progress = Math.max(0, Math.min(body.data.duration, body.data.progress));

		if(typeof body.data.title !== 'string' || !Array.isArray(body.data.artists)) {
			this.info.progress = body.data.progress;
			return;
		}

		if(typeof body.data.duration !== 'number' || !isFinite(body.data.duration) || body.data.duration < 0)
			return;

		const matchResult = Array.from(body.data.title.matchAll(this.titleRegex));
		if(matchResult) {
			if(matchResult.length > 1) {
				if (matchResult[0] && matchResult[0][1]) {
					body.data.artists.unshift(matchResult[0][1].trim());
					body.data.title = matchResult[0][2].trim();
				} else {
					if (matchResult[0] && matchResult[0][2]) {
						body.data.artists.unshift(matchResult[0][2].trim());
					}
					body.data.title = matchResult[1][2].trim();
				}
			} else {
				if (matchResult[0][1]) {
					body.data.artists.unshift(matchResult[0][1].trim());
				}
				body.data.title = matchResult[0][2].trim();
			}
		}

		let artist = body.data.artists[0];
		if (body.data.artists.length > 2) {
			artist = body.data.artists[1];
		}

		this.info.$assign({
			playing: true,
			title: body.data.title,
			artist: artist, // body.data.artists.join(", "),
			progress: body.data.progress,
			duration: body.data.duration
		});

		if(body.data.cover_url && body.data.cover_url !== this.lastUri) {
			this.lastUri = body.data.cover_url;
			await this.updateLyric(null);
		}
	}

	async updateLyric(spotifyLyric) {
		try {
			const lyric = await (
				alsong(this.info.artist, this.info.title, { playtime: Number(this.info.duration) })
					.then(lyricItems => {
						console.log(`Retrieved alsong info: ${lyricItems[0].artist} - ${lyricItems[0].title}`);
						return alsong.getLyricById(lyricItems[0].lyricId);
					})
					.then(lyricData => lyricData.lyric)
					.catch(err => {
						if (typeof spotifyLyric !== 'object') {
							return {};
						}
						
						return spotifyLyric;
					})
			);

			if(!lyric['0']) {
				lyric['0'] = [];
			}
			
			const timestamp = Object.keys(lyric).sort((v1, v2) => parseInt(v1) - parseInt(v2));
			this.info.lyric = {
				timestamp,
				lyric
			};
			this.lastUpdate = -1;

			console.log(`Retrieved lyric: ${this.info.artist} - ${this.info.title}`);
		} catch(e) {
			this.info.lyric = {
				timestamp: ['0'],
				lyric: {
					'0': []
				},
				current: []
			};
			this.lastUpdate = -1;
			console.error(`Error while retrieving lyric: ${e}`);
		}
	}

	updateProgress() {
		if(!this.info.lyric)
			return;

		let i = 0;
		for(; i < this.info.lyric.timestamp.length; i++) {
			if(this.info.lyric.timestamp[i + 1] > this.info.progress)
				break;
		}

		if(this.lastUpdate !== i) {
			const currentLyric = (this.info.lyric.lyric[this.info.lyric.timestamp[i]] || []).slice();
			while(config.lyric.count > currentLyric.length) {
				currentLyric.unshift('');
			}

			this.info.lyric.current = currentLyric;
			this.lastUpdate = i;
		}
	}
}

const api = new Alspotify();
module.exports = () => {
	api.init();

	return api.info;
};
module.exports.alspotify = api;
