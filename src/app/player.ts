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

		this.player = new Radio.Icecast({
			path: 'https://insanityradio.com/listen/get_current_stream.mp3'
		});

		this.presentationDelay = 5000;

		this.player.stateChange(() => {
			console.log("State Change!")
			change.detectChanges()
		});

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


