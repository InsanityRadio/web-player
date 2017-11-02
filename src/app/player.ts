import {Component, ChangeDetectorRef} from '@angular/core';
import {OnsNavigator} from 'angular2-onsenui';

import {Radio} from './radio';

declare var RemoteCommand:any;
declare var cordova:any;

@Component({
	selector: 'player',
	template: require('./player.html'),
	styles: [require('./player.css')]
})
export class Player {

	player:any;
	presentationDelay:number = 0;

	constructor (private change:ChangeDetectorRef) {

		this.player = Radio.Detector.getBestPlayer({
			/* hls: {
				manifest: 'http://10.32.0.126/hls/aud_hi.m3u8'
			}, */
			icecast: {
				path: 'https://insanityradio.com/listen/get_current_stream.mp3'
			}
		});


		this.presentationDelay = this.player.presentationDelay;

		this.player.stateChange(() => {
			console.log("State Change!")
			change.detectChanges()
		});

		var userAgent = window.navigator.userAgent;
		// Are we on a mobile browser?
		if (cordova.platformId == "browser" && ((/(iPad|iPhone|iPod)/gi).test(userAgent)
			|| (/CriOS/).test(userAgent)
			|| (/FxiOS/).test(userAgent)
			|| (/OPiOS/).test(userAgent)
			|| (/mercury/).test(userAgent)
			|| (/Mobile Safari/).test(userAgent))) {

			// this.player.stop()
			console.log('Not autoplaying, in browser')
			return;
		}

		console.log('On device, registering hooks and autoplaying')
		if (typeof RemoteCommand !== 'undefined') {
			this.hookRemoteCommand();
		}

		// Autoplay on every other platform (iOS/Android will ungracefully not autoplay)
		this.player.play()

	}

	hookRemoteCommand () {

		RemoteCommand.enabled('nextTrack', false);
		RemoteCommand.enabled('previousTrack', false);

		RemoteCommand.on('command', function (command) { 

			console.log('received command: ', command)
			switch (command) {
				case 'play': this.player.play(); break;
				case 'pause': this.player.stop(); break;
			}

		});

	}

	playing () {
		return this.player.playing;
	}

	buffering () {
		return this.player.buffering;
	}

	toggle () {
		this.player.toggle();
	}

}


