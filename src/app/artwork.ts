import {Component, Input} from '@angular/core';
import {OnsNavigator} from 'angular2-onsenui';

@Component({
	selector: 'artwork',
	template: require('./artwork.html'),
	styles: [require('./artwork.css')]
})
export class Artwork {
	@Input() url:string;

	protected defaultImage:string = require('../public/resources/default_artwork.jpg');

	constructor() {
	}
}


