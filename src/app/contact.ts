import {Component, Input, AfterViewInit} from '@angular/core';
import {OnsNavigator} from 'angular2-onsenui';

import {Metadata} from './metadata';

@Component({
	selector: 'contact',
	template: require('./contact.html'),
	styles: [require('./contact.css')]
})
export class ContactForm implements AfterViewInit {

	@Input() modal:any;
	name:string = '';
	message:string = '';
	allowedCharacters:number = 140;
	sending:boolean = false;
	error:string = 'ERROR TEXT';

	constructor (private navi : OnsNavigator) {
		this.sending = false;
	}

	ngAfterViewInit() {
		let that = this;
		this.modal.addEventListener('preshow', function () {
			that.sending = false;
			that.error = '';
		})
	}

	remaining() {
		return this.allowedCharacters - this.message.length;
	}

	send () {
		this.sending = true;
		this.error = '';
		let that = this;
		window['fetch']('https://webapi.insanityradio.com/message/post').then(function (data) {
			data.json();
		}).then(function (data) {
			if (data.error) {
				return this.showError(data.error);
			}
			that.modal.hide({ animation: 'lift' });
		}).catch(function (error) {
			console.log('error?', error)
			that.showError(error.message.substr(0, 12) == 'NetworkError' ? null : error.message);
		})
	}

	showError (text) {
		this.sending = false;
		if (text != '' && text != null) {
			this.error = text;
		} else {
			this.error = 'Oops - something went wrong! Try again, or alternatively get in touch via email!';
		}
	}

}


