import {Component, ChangeDetectorRef, Input, OnInit} from '@angular/core';
import {OnsNavigator} from 'angular2-onsenui';

import {Artwork} from './artwork';
import {Metadata} from './metadata';
import {Radio} from './radio';

declare var RemoteCommand:any;

@Component({
	selector: 'player',
	template: require('./player.html'),
	styles: [require('./player.css')]
})
export class Player implements OnInit {

	@Input() artwork:Artwork;
	@Input() metadata:Metadata;

	player:any;
	presentationDelay:number = 0;

	constructor (private change:ChangeDetectorRef) {


	}

	isVideo () {
		return !(this.player == null || !this.player.isVideo());
	}

	video () {
		var isPlaying = this.playing;
		this.initPlayer(!this.isVideo());
		if (isPlaying) {
			this.player.play();
		}
	}

	ngOnInit () {

		console.log(this.artwork);

		var video = false;
		this.initPlayer(video);

		var userAgent = window.navigator.userAgent;
		// Are we on a mobile browser?
		console.log('Checking mobile target...', window['cordova'])
		if ((!window['cordova'] || window['cordova'].platformId == "browser") && ((/(iPad|iPhone|iPod)/gi).test(userAgent)
			|| (/CriOS/).test(userAgent)
			|| (/FxiOS/).test(userAgent)
			|| (/OPiOS/).test(userAgent)
			|| (/mercury/).test(userAgent)
			|| (/Mobile Safari/).test(userAgent))) {

			// this.player.stop()
			console.log('Not autoplaying, in browser')
			return;
		}

		console.log('On device, registering hooks and autoplaying')
		if (typeof RemoteCommand !== 'undefined') {
			this.hookRemoteCommand();
		}

		// Autoplay on every other platform (iOS/Android will ungracefully not autoplay)
		this.player.play()

	}

	initPlayer (video:boolean) {

		if (this.player) {
			this.player.stop();
			this.player.unload();
		}

		this.player = Radio.Detector.getBestPlayer({
			hls: video ? {
				manifest: 'https://scdnc.insanityradio.com/manifest/hls/video.m3u8',
				container: this.artwork.video.nativeElement
			} : {
				manifest: 'https://scdnc.insanityradio.com/dash/hls/insanity/index.m3u8'
			},
			icecast: {
				path: 'https://stream.cor.insanityradio.com/insanity320.mp3'
			}
		});

		this.artwork.useVideo = this.isVideo();

		this.presentationDelay = this.player.presentationDelay;

		this.player.stateChange((e) => {
			console.log("State Change!", e)
			this.change.detectChanges()
		});

	}

	hookRemoteCommand () {

		RemoteCommand.enabled('nextTrack', false);
		RemoteCommand.enabled('previousTrack', false);

		RemoteCommand.on('command', function (command) { 

			console.log('received command: ', command)
			switch (command) {
				case 'play': this.player.play(); break;
				case 'pause': this.player.stop(); break;
			}

		});

	}

	playing () {
		return this.player.playing;
	}

	buffering () {
		return this.player.buffering;
	}

	toggle () {
		this.player.toggle();
	}

}


