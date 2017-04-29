// Onsen UI Styling and Icons
require('onsenui/stylus/blue-basic-theme.styl');
require('onsenui/css/onsenui.css');

// Application code starts here
import {enableProdMode, NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {HttpModule} from '@angular/http';
import {OnsenModule} from 'angular2-onsenui';

import {Insanity} from './app/app';
import {Artwork} from './app/artwork';
import {Shell} from './app/shell';
import {Player} from './app/player';
import {Metadata} from './app/metadata';
import {SongHistory} from './app/history';

console.log(process);

// Enable production mode when in production mode.
if (process.env.NODE_ENV === 'production') {
	enableProdMode();
}

@NgModule({
	imports: [
		OnsenModule, // has BrowserModule internally
		HttpModule,
	],
	declarations: [
		Insanity,
		Shell,
		Player,
		Metadata,
		Artwork,
		SongHistory
	],
	entryComponents: [
		Shell,
		Player,
		Metadata,
		Artwork
	],
	bootstrap: [
		Insanity,
	],
	schemas: [
		CUSTOM_ELEMENTS_SCHEMA,
	],
})
class AppModule {}


//these functions runs when Cordova is ready
function onDeviceReady () {
	console.log("[DEBUG] Cordova is loaded/ready, launching")
    platformBrowserDynamic().bootstrapModule(AppModule)
		.catch(err => console.error(err));
}

onDeviceReady();
//document.addEventListener ("deviceready", onDeviceReady, false);


document.ontouchmove = function(event){
    event.preventDefault();
}
