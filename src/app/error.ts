import {Component, Input} from '@angular/core';
import {OnsNavigator} from 'angular2-onsenui';

@Component({
	selector: 'error',
	template: require('./error.html'),
	styles: [require('./error.css')]
})
export class ErrorDialog {

	@Input() modal:any;

	constructor(private navi : OnsNavigator) {
	}

}

