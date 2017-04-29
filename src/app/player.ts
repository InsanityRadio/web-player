import {Component, ChangeDetectorRef} from '@angular/core';
import {OnsNavigator} from 'angular2-onsenui';

import {Radio} from './radio';

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
		// Are we iOS?
		if ( (/(iPad|iPhone|iPod)/gi).test(userAgent)
			&&!(/CriOS/).test(userAgent)
			&&!(/FxiOS/).test(userAgent)
			&&!(/OPiOS/).test(userAgent)
			&&!(/mercury/).test(userAgent)) {

			return;
		}

		// Autoplay on every other platform (iOS will ungracefully not autoplay)
		this.player.play()

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


