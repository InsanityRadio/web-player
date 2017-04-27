import {HTTP} from './http';
declare var Audio:any;

var NchanSubscriber = require('../NchanSubscriber.js');

console.log(NchanSubscriber)

export module Radio {

	export abstract class Player {

		protected stateChangeListeners:Array<(player:Player) => void> = [];

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
			  artist: str
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
		}

		play () {
			var path = this.options.path + (this.options.path.indexOf("?") != -1 ? '&' : '?') + new Date().getTime();
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
			data.now = new Date(data.now).getTime()
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
			this.sub.on('message', (message) => this.update(message, callback))

			this.sub.start();

		}

		update (message:any, callback:(response) => void) {
			var data = JSON.parse(message)
			data.now = new Date(data.now).getTime()
			callback(data);
		}

		unload () {	
			this.sub.stop();
			delete this.sub;
		}

	}

}
