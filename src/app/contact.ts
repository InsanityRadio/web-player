import {Component, Input} from '@angular/core';
import {OnsNavigator} from 'angular2-onsenui';

import {Metadata} from './metadata';

@Component({
	selector: 'contact',
	template: require('./contact.html'),
	styles: [require('./contact.css')]
})
export class ContactForm {

	@Input() modal:any;
	name:string = '';
	message:string = '';
	allowedCharacters:number = 140;

	constructor (private navi : OnsNavigator) {
	}

	remaining() {
		return this.allowedCharacters - this.message.length;
	}

	send () {
		this.modal.hide({ animation: 'lift' })
	}

}


