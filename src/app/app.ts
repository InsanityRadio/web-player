import {Component,ViewChild,ElementRef} from '@angular/core';
import {OnsSplitterContent, OnsSplitterSide, OnsNavigator} from 'angular2-onsenui';

import {Shell} from './shell';

@Component({
  selector: 'app',
  template: require('./app.html'),
  styles: [require('./app.css')]
})
export class Insanity {
	@ViewChild('navigator') navigator: OnsNavigator;
	page:any;

	constructor() {
		this.page = Shell;
	}
}