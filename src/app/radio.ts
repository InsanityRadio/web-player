import {HTTP} from './http';

declare var Audio:any;
declare var Media:any;

var NchanSubscriber = require('../NchanSubscriber.js');

function parseDate(date) {
	const parsed = Date.parse(date);
	if (!isNaN(parsed)) {
		return new Date(parsed);
	}
	return new Date(Date.parse(date.replace(/-/g, '/').replace(/[a-z]+/gi, ' ')));
}

export module Radio {

	export abstract class Player {

		protected stateChangeListeners:Array<(player:Player) => void> = [];

		presentationDelay : number;

		constructor (protected options:any) {}

		play () {}

		stop () {}

		toggle () {}

		metadata () {}

		stateChange (handler:(player:Player) => void) {
			this.stateChangeListeners.push(handler);
		}

		handleStateChange() {
			this.stateChangeListeners.forEach((a) => a(this));
		}

	}

	export class Metadata {

		public timer:boolean;

		constructor (protected options:any) {}
		/**
		 * timestamp should be a UNIX timestamp (ie. not in milliseconds) corresponding to the seek time
		 * response should be an Object with (at least) the following:
		 * {
		     nowPlaying: {
			  song: str,
			  artist: str,
			  album_art: str|null
		     },
		     currentShow: {
			  showName: str,
			  showPresenters: str
		     }
		    }
		 */
		load (timestamp, callback:(response) => void) { }

		unload () { }

	}

	/**
		You *NEED* to add the following to your icecast.xml config:

		<http-headers>
		    <header name="Cache-Control" value="no-cache" />
		    <header name="Expires" value="0" />
		</http-headers>

		Otherwise the browser will likely cache your stream. This is not what you want. 
	*/
	export class Icecast extends Player {

		private audio:any;
		private played:boolean = false;

		constructor (options:Object) {
			super(options);
			this.audio = null;

			var webkit = 'WebkitAppearance' in document.documentElement.style;
			var gecko = 'MozAppearance' in document.documentElement.style;

			this.presentationDelay = webkit ? 10000 : (gecko ? 3000 : 5000);
		}

		play () {
			var path = this.options.path + (this.options.path.indexOf("?") != -1 ? '&' : '?') + Date.now();
			this.played = false;

			if(this.audio != null)
				this.stop();

			this.audio = new Audio(path);
			this.audio.addEventListener("playing", () => this.handleStateChange());
			this.audio.addEventListener("pause", () => this.handleStateChange());
			this.audio.addEventListener("stalled", () => this.handleStateChange());
			this.audio.play();
		}

		handleStateChange() {
			if(this.playing)
				this.played = true;

			super.handleStateChange();
		}

		stop () {
			this.audio.pause();
			this.audio = null;
		}

		get playing():boolean {
			return this.audio != null && this.audio.duration > 0 && !this.audio.paused;
		}

		get buffering():boolean {
			return this.audio != null && (!this.played || this.audio.readyState < this.audio.HAVE_FUTURE_DATA);
		}

		toggle () {
			this.playing ? this.stop() : this.play();
		}

	}

	export class Native extends Player {

		private audio:any;
		private played:boolean = false;

		constructor (options:Object) {
			super(options);
			this.audio = null;

			var webkit = 'WebkitAppearance' in document.documentElement.style;
			var gecko = 'MozAppearance' in document.documentElement.style;
			this.presentationDelay = webkit ? 10000 : (gecko ? 3000 : 5000);

		}

		play () {
			var path = this.options.path + (this.options.path.indexOf("?") != -1 ? '&' : '?') + Date.now();
			this.played = false;

			if(this.audio != null)
				this.stop();

			var handler = (a) => this.handleStateChange();

			this.audio = new Media(path, handler, handler, handler)
			this.audio.play({ playAudioWhenScreenIsLocked : true });
		}

		handleStateChange() {
			if(this.playing)
				this.played = true;

			super.handleStateChange();
		}

		stop () {
			this.audio.stop();
			this.audio.release();
			this.audio = null;
		}

		get playing():boolean {
			return this.audio != null && this.audio.state == Media.MEDIA_RUNNING;
		}

		get buffering():boolean {
			return this.audio != null && this.audio.state == Media.MEDIA_STARTING;
		}

		toggle () {
			this.playing ? this.stop() : this.play();
		}

	}


	export class VideoElement extends Player {

		private audio:any;
		private played:boolean = false;

		constructor (options:Object) {
			super(options);
			this.audio = null;
			this.presentationDelay = 15000;
		}

		play () {
			var path = this.options.manifest + (this.options.manifest.indexOf("?") != -1 ? '&' : '?') + Date.now()
			this.played = false;

			if(this.audio != null)
				this.stop();

			// this.audio = new Audio(path);
			this.audio = document.createElement('video');
			this.audio.src = path;
			this.audio.autoPlay = true;
			this.audio.setAttribute('playsinline', '1');

			this.audio.addEventListener("playing", () => this.handleStateChange());
			this.audio.addEventListener("pause", () => this.handleStateChange());
			this.audio.addEventListener("stalled", () => this.handleStateChange());
			this.audio.play();

			console.log('hello!!!')

		}

		handleStateChange() {
			if(this.playing)
				this.played = true;

			super.handleStateChange();
		}

		stop () {
			this.audio.pause();
			this.audio = null;
		}

		get playing():boolean {
			return this.audio != null && this.audio.duration > 0 && !this.audio.paused;
		}

		get buffering():boolean {
			return this.audio != null && (!this.played || this.audio.readyState < this.audio.HAVE_FUTURE_DATA);
		}

		toggle () {
			this.playing ? this.stop() : this.play();
		}

	}

	export class HLS extends VideoElement {

		constructor (options:Object) {
			var canPlay = document.createElement('video').canPlayType('application/vnd.apple.mpegURL');
			if (!canPlay) {
				throw new Error('Device does not support HLS');
			}
			super(options)
		}

	}

	export class InsanityAPI extends Metadata {

		public timer:boolean = true;

		constructor (options:any) {
			super(options);
		}

		load (timestamp, callback:(response) => void) {
			var http = new HTTP.GET(this.options.path, (a) => this.update(a, callback), () => false);
		}

		update (http:HTTP.Request, callback:(response) => void) {
			var data = JSON.parse(http.responseText)
			data.now = parseDate(data.now).getTime()
			callback(data);
		}

		unload () { }

	}

	export class InsanityStreamAPI extends Metadata {

		public timer:boolean = false;
		private sub:any;

		constructor (options:any) {
			super(options);
		}

		load (timestamp, callback:(response) => void) {

			this.sub = new NchanSubscriber('https://webapi.insanityradio.com/subscribe?id=1', {
				'reconnect': undefined
			})
			this.sub.on('message', (message) => this.update(message, callback));

			// this.sub.on('error', (message) => this.sub.start());
			// this.sub.on('disconnect', (message) => this.sub.start());

			this.sub.start();

		}

		update (message:any, callback:(response) => void) {
			var data = JSON.parse(message)
			data.now = parseDate(data.now).getTime()
			callback(data);
		}

		unload () {	
			this.sub.stop();
			delete this.sub;
		}

	}


	export class Detector { 

		static getBestPlayer (options:any) : Player {

			try {
				if (typeof Media !== 'undefined') {
					return new Native(options.icecast);
				}
			} catch (e) {}

			try {
				if ('hls' in options) {
					return new HLS(options.hls);
				}
			} catch (e) {}

			try {
				if ('icecast' in options) {
					return new Icecast(options.icecast);
				}
			} catch (e) {}

			throw new Error('No supported player type. Browser not supported?')

		}

		static getBestMetadata (options:any) {

			return 

		}

	}

}
