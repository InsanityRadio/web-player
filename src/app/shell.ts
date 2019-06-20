import {Component, NgZone, ViewChild} from '@angular/core';
import {OnsNavigator,Params} from 'angular2-onsenui';

import {HTTP} from './http';
import {Metadata} from './metadata';
import {Player} from './player';
import {Artwork} from './artwork';

import * as ons from 'onsenui';

@Component({
	selector: 'ons-page[shell]',
	template: require('./shell.html'),
	styles: [require('./shell.css')]
})
export class Shell {
	@ViewChild('modalError') modalError:any;
	@ViewChild('player') player:Player;
	@ViewChild('metadata') metadata:Metadata;
	@ViewChild('artwork') artwork:Artwork;

	private browser:boolean = process.browser;

	constructor (private navi : OnsNavigator, private zone: NgZone, private _params: Params) {
	}

	navigateTo (url:string) {
		ons.notification.confirm({
			messageHTML: "<h3><b>Are you sure?</b></h3>Playback will stop if you leave this page.<br /><br />",
			cancelable: true,
			title: '',
			callback: i => {
				if (i < 1) {
					return;
				}
				window.location.href = url;
			}
		});
	}

}


