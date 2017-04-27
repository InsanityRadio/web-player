import {Component} from '@angular/core';
import {OnsNavigator} from 'angular2-onsenui';

@Component({
  selector: 'ons-page[page]',
  template: require('./error.html'),
  styles: [require('./error.css')]
})
export class Error {
  constructor(private navi : OnsNavigator) {
  }

  push() {
    this.navi.element.pushPage(null);
  }
}


