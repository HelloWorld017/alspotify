const alsong = require('alsong');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./utils/Config')();
const express = require('express');
const observable = require('./utils/Observable');

class Alspotify {
	constructor() {
		this.info = observable.init('api', {});
		this.lastUri = null;
		this.lastUpdate = -1;

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

		});

		this.app = app;
		this.initialized = false;
	}

	init() {
		if(this.initialized)
			return;

		this.initialized = true;
		this.app.listen(29192);
		this.info.$observe(() => {
			this.updateProgress();
		});
		setInterval(() => this.tick(), 50);
	}

	tick() {
		this.info.progress = Math.min(
			this.info.duration,
			this.info.progress + 50
		);
	}

	async update(body) {
		if(typeof body.timestamp !== 'number' || !isFinite(body.timestamp))
			return;

		if(Math.abs(body.timestamp - Date.now()) > 5000)
			return;

		if(!body.playing) {
			this.info.playing = false;
			return;
		}

		if(
			typeof body.progress !== 'number' ||
			!isFinite(body.progress) ||
			body.progress < 0 ||
			body.progress > body.duration
		)
			return;

		body.progress += Date.now() - body.timestamp;
		body.progress = Math.max(0, Math.min(body.duration, body.progress));

		if(typeof body.title !== 'string' || typeof body.artist !== 'string') {
			this.info.progress = body.progress;
			return;
		}

		if(typeof body.duration !== 'number' || !isFinite(body.duration) || body.duration < 0)
			return;

		this.info.$assign({
			playing: true,
			title: body.title,
			artist: body.artist,
			progress: body.progress,
			duration: body.duration
		});

		if(body.uri && body.uri !== this.lastUri) {
			this.lastUri = body.uri;
			await this.updateLyric(body.lyrics);
		}
	}

	async updateLyric(spotifyLyric) {
		try {
			const lyrics = await alsong(this.info.artist, this.info.title);
			if(lyrics.length === 0) {
				if(typeof spotifyLyric !== 'object' || Object.keys(spotifyLyric).length === 0) {
					this.info.lyric = {
						timestamp: {},
						lyric: []
					};

					return;
				}

				lyrics.push({ lyric: spotifyLyric });
			}

			//TODO change fetch algorithm
			//     For example, select longest one between lyrics,
			//     which last lyric timestamp is smaller than duration

			const lyric = lyrics[0].lyric;

			const timestamp = Object.keys(lyric).sort((v1, v2) => parseInt(v1) - parseInt(v2));
			this.info.lyric = {
				timestamp,
				lyric
			};
			this.lastUpdate = -1;

			console.log(`Retrieved lyric: ${this.info.artist} - ${this.info.title}`);
		} catch(e) {
			console.error(`Error while retrieving lyric: ${e}`);
		}
	}

	updateProgress() {
		if(!this.info.lyric)
			return;

		let i = 0;
		for(; i < this.info.lyric.timestamp.length; i++) {
			if(i + 1 >= this.info.lyric.timestamp.length)
				continue;

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
