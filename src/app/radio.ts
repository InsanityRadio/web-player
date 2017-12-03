import {HTTP} from './http';


declare var Audio:any;
declare var Media:any;

var NchanSubscriber = require('../NchanSubscriber.js');
var Hls = require('../Hls.js');

function parseDate(date) {
	const parsed = Date.parse(date);
	if (!isNaN(parsed)) {
		return new Date(parsed);
	}
	return new Date(Date.parse(date.replace(/-/g, '/').replace(/[a-z]+/gi, ' ')));
}

export module Radio {

	export abstract class Player {

		protected stateChangeListeners:Array<(player:Player, e?:any) => void> = [];

		presentationDelay : number;

		constructor (protected options:any) {}

		play () {}

		stop () {}

		toggle () {}

		metadata () {}

		unload () {}

		stateChange (handler:(player:Player, e?:any) => void) {
			this.stateChangeListeners.push(handler);
		}

		handleStateChange(e) {
			this.stateChangeListeners.forEach((a, _) => a(this, e));
		}

		isVideo () {
			return false;
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

		protected audio:any;
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
			this.audio.addEventListener("playing", (e) => this.handleStateChange(e));
			this.audio.addEventListener("pause", (e) => this.handleStateChange(e));
			this.audio.addEventListener("stalled", (e) => this.handleStateChange(e));
			this.audio.play();
		}

		handleStateChange(e) {
			if(this.playing)
				this.played = true;

			super.handleStateChange(e);
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

			var handler = (a) => this.handleStateChange(a);

			this.audio = new Media(path, handler, handler, handler)
			this.audio.play({ playAudioWhenScreenIsLocked : true });
		}

		handleStateChange(e) {
			if(this.playing)
				this.played = true;

			super.handleStateChange(e);
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

		protected audio:any;
		protected played:boolean = false;

		constructor (options:Object) {
			super(options);
			this.audio = null;
			this.presentationDelay = 30000;
		}

		isVideo () {
			return this.options.container != null;
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

			this.audio.addEventListener("playing", (e) => this.handleStateChange(e));
			this.audio.addEventListener("pause", (e) => this.handleStateChange(e));
			this.audio.addEventListener("stalled", (e) => this.handleStateChange(e));
			this.audio.play();

		}


		handleStateChange(e) {
			if(this.playing)
				this.played = true;

			super.handleStateChange(e);
		}

		unload () {
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

		protected ready:boolean = false;
		protected hls:any;
		protected waiting:boolean = false;

		constructor (options) {

			super(options);
			this.ready = false;

			if (this.options.container) {
				this.audio = this.options.container;
			} else {
				this.audio = document.createElement('video');

				// Firefox doesn't support HE-AAC on Mac for some reason. Bug 1387127
				// It plays it as a AAC-LC which sounds worse than DAB.
				let navi = navigator.userAgent.toLowerCase();
				if (navi.indexOf('firefox') > -1 && navi.indexOf('macintosh') > -1) {
					throw new Error('HLS with audio does not work on Firefox on macOS');
				}

			}

			this.hls = new Hls({
				maxBufferLength: 60,
				fragLoadingMaxRetry: 99
			});

			this.hls.loadSource(this.options.manifest);
			this.hls.attachMedia(this.audio);
			this.hls.on(Hls.Events.MANIFEST_PARSED, function () {
				this.ready = true;
				this.playIfWaiting();
			}.bind(this));

		}

		play () {

			if (!this.ready) { 
				this.waiting = true;
				return;
			}

			this.played = false;

			//if(this.audio != null)
			//	this.stop();

			this.audio.autoPlay = true;
			this.audio.setAttribute('playsinline', '1');

			this.audio.addEventListener("playing", (e) => this.handleStateChange(e));
			this.audio.addEventListener("pause", (e) => this.handleStateChange(e));
			this.audio.addEventListener("stalled", (e) => this.handleStateChange(e));
			this.audio.play();

		}

		unload () {
			this.hls.detachMedia();
			this.hls.destroy();
		}

		stop () {
			this.audio.pause();
		}

		playIfWaiting () {
			console.log('erm')
			if (this.waiting) {
				console.log('about to play')
				this.play();
			}
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
