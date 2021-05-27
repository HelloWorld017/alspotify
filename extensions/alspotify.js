// NAME: Alspotify Companion
// AUTHOR: Khinenw
// DESCRIPTION: Get current playing information to show in Alspotify


(function Alspotify() {
	const LyricResolvers = {
		v1(uri) {
			return new Promise((resolve, reject) => {
				Spicetify.CosmosAPI.resolver.get(
					`hm://lyrics/v1/track/${uri.getBase62Id()}`,
					(err, payload) => {
						if(err) {
							resolve([]);
							return;
						}

						const result = payload.getJSONBody();
						resolve(result.lines);
					}
				);
			});
		},
		
		v2(uri) {
			return Spicetify.CosmosAsync
				.get(`hm://lyrics/v1/track/${uri.getBase62Id()}`)
				.then(payload => payload.lines)
				.catch(err => {
					return [];
				});
		},
		
		get current() {
			return this[Spicetify.CosmosAsync ? 'v2' : 'v1'];
		}
	};
	
	const getLyric = async () => {
		const uri = Spicetify.URI.from(Spicetify.Player.data.track.uri);
		const lines = await LyricResolvers.current(uri);
		return lines.reduce((lyric, line) => {
			lyric[line.time] = line.words.map(v => v.string).filter(v => v);
			return lyric;
		}, {});
	};
	
	let previousInfo = {};
	const getInfo = async () => {
		if(!Spicetify.Player.isPlaying()) {
			return {
				playing: false
			};
		}

		const uri = Spicetify.Player.data.track.uri;
		if(previousInfo.uri !== uri) {
			return {
				playing: true,
				title: Spicetify.Player.data.track.metadata.title,
				artist: Spicetify.Player.data.track.metadata.artist_name,
				uri,
				duration: Spicetify.Player.getDuration(),
				progress: Spicetify.Player.getProgress(),
				lyrics: await getLyric()
			};
		}

		return {
			playing: true,
			uri,
			duration: Spicetify.Player.getDuration(),
			progress: Spicetify.Player.getProgress()
		};
	};

	const sendInfo = async () => {
		const info = await getInfo();
		previousInfo = info;

		await fetch('http://localhost:29192/', {
			method: 'POST',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				...info,
				timestamp: Date.now()
			})
		});
	};

	setInterval(sendInfo, 3000);
})();
