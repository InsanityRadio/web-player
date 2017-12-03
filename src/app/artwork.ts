import {Component, Input, ViewChild} from '@angular/core';
import {OnsNavigator} from 'angular2-onsenui';

@Component({
	selector: 'artwork',
	template: require('./artwork.html'),
	styles: [require('./artwork.css')]
})
export class Artwork {
	@Input() url:string;
	@Input() useVideo:boolean;

	@ViewChild('video') video;

	protected defaultImage:string = require('../public/resources/default_artwork.jpg');

	constructor() {
	}
}


