const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');

const EventEmitter = require('events');

class AlspotifyApi extends EventEmitter {
	constructor() {
		super();
		this.info = { playing: false };
		
		const app = express();
		app.use(cors());
		app.use(bodyParser.json());

		app.post('/', (req, res, next) => {
			this.update(req.body);
			res.end();
		});
		
		this.app = app;
	}
	
	init() {
		this.app.listen(29192);
		setInterval(() => this.tick(), 100);
	}
	
	tick() {
		this.info.progress += 100;
		this.info.progress = Math.min(this.info.duration, this.info.progress);
		this.emit('update-partial', 'progress');
	}
	
	update(body) {
		if(!body.playing) {
			this.info = body;
			return;
		}
		
		if(typeof body.title !== 'string' || typeof body.artist !== 'string')
			return;
		
		if(typeof body.duration !== 'number' || !isFinite(body.duration) || body.duration < 0)
			return;
		
		if(typeof body.progress !== 'number' || !isFinite(body.progress) || body.progress < 0 || body.progress > body.duration)
			return;
		
		this.info = body;
	}
	
	get info() {
		return this._info;
	}
	
	set info(newInfo) {
		this._info = newInfo;
		this.emit('update', newInfo);
	}
}

module.exports = AlspotifyApi;