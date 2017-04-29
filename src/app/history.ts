import {Component, Input} from '@angular/core';
import {OnsNavigator} from 'angular2-onsenui';

import {Metadata} from './metadata';

@Component({
	selector: 'history',
	template: require('./history.html'),
	styles: [require('./history.css')]
})
export class SongHistory {

	@Input() metadata:Metadata;

	constructor (private navi : OnsNavigator) {
		setTimeout(() => console.log(this.metadata.history), 2000)
	}

	history () {

		var h = [];
		for (var i in this.metadata.history) {
			h.push(this.metadata.history[i])
		}
		h.reverse()
		return h;

	}

	open (row:any, type:string) {

		if(!(type in row.nowPlaying.external_urls)) {
			return;
		}

		window.open(row.nowPlaying.external_urls[type], '_blank');

	}

}


