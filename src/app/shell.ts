import {Component, NgZone, ViewChild} from '@angular/core';
import {OnsNavigator,Params} from 'angular2-onsenui';

import {HTTP} from './http';
import {Metadata} from './metadata';
import {Player} from './player';
import {Artwork} from './artwork';

@Component({
	selector: 'ons-page[shell]',
	template: require('./shell.html'),
	styles: [require('./shell.css')]
})
export class Shell {
	@ViewChild('player') player:Player;
	@ViewChild('metadata') metadata:Metadata;
	@ViewChild('artwork') artwork:Artwork;

	private browser:boolean = process.browser;

	constructor (private navi : OnsNavigator, private zone: NgZone, private _params: Params) {
		
	}

}


