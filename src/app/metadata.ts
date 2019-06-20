
import {Component, ChangeDetectorRef, Input}  from '@angular/core';
import {OnsNavigator} from 'angular2-onsenui';

import {Player} from './player';
import {Artwork} from './artwork';

import {Radio} from './radio';

declare var NowPlaying:any;


@Component({
	selector: 'metadata',
	template: require('./metadata.html'),
	styles: [require('./metadata.css')]
})
export class Metadata {

	@Input() player:Player;
	@Input() artwork:Artwork;

	@Input() presentationDelay:number;

	protected meta:Radio.Metadata;
	protected timer:any;

	protected template:any = {
		nowPlaying: {
			artist: "Unknown",
			song: "Data Not Available",
			album_art: null
		},
		currentShow: {
			showName: "Unknown",
			showPresenters: "Data Not Available"
		},
		video: false,
		now: new Date(0)
	};

	protected data:any = {};
	history:any = {};

	private interval:number = 8000;
	private total:number = 10;

	private changeTimer:any = null;

	constructor(private change:ChangeDetectorRef) {

		this.meta = new Radio.InsanityStreamAPI({
			path: "https://insanityradio.com/listen/load_metadata"
		});

		this.data = this.template;

		// this.meta.load(new Date().getTime() / 1000, (a) => this.update(a))

		// if (this.meta.timer) {
		//	this.timer = setTimeout(() => this.refresh(), this.interval);
		// }

		this.refresh();

	}

	refresh() {

		this.meta.load(new Date().getTime() / 1000, (a) => {

			this.update(a);

			if (this.meta.timer) {
				this.timer = setTimeout(() => this.refresh(), this.interval);
			}
			this.getSong()

		});

	}

	update(data, time?) {

		time = time == null ? Date.now() : time;

		// Remove any old keys.
		// We can't be sure what order the browser will iterate this object, though. Hence this mess. 

		if (data != null) {
			var sorted = Object.keys(this.history).sort();
			var history = {};

			for (var i = sorted.length - this.total; i < sorted.length; i++) {
				if (i < 0) {
					continue;
				}
				history[sorted[i]] = this.history[sorted[i]];
			}

			history[data.now] = data;
			this.history = history;
		}

		data = this.getSongAt(time)

		this.detectChangesWithTimer()
		this.change.detectChanges()

	}

	detectChangesWithTimer () {
		if (this.changeTimer == null) {
			this.changeTimer = setTimeout(() => {
				this.change.detectChanges()
				this.changeTimer = null;
			}, 100);
		}
	}

	/* 
	 * Returns the song at the given timestamp (JS style)
	 */
	getSongAt (time) {

		var sorted = Object.keys(this.history).sort();
		var closestMatch = this.template;

		for (var i = 0; i < sorted.length; i++) {
			if (parseInt(sorted[i]) > time) {
				break;
			}

			closestMatch = this.history[sorted[i]];
		}
		this.resetForNew()

		return closestMatch;

	}

	getSong () {
		this.data = this.getSongAt(Date.now() - this.presentationDelay);
		this.change.detectChanges()
		if (typeof NowPlaying !== 'undefined') {
			NowPlaying.set({
				artwork: this.data.nowPlaying.album_art,
				artist: this.data.nowPlaying.artist,
				title: this.data.nowPlaying.song,
			});
		}
	}

	hasVideo () {
		return this.data.video;
	}

	/*
	 * Returns the duration until the next song starts, if we have a presentation delay
	 */
	getSongInterval () {

		var time = Date.now() - this.presentationDelay;

		var sorted = Object.keys(this.history).sort();
		var interval = -1;

		for (var i = 0; i < sorted.length; i++) {
			if (parseInt(sorted[i]) > time) {
				interval = parseInt(sorted[i]) - time;
				break;
			}
		}

		return interval;

	}

	resetForNew () {

		clearTimeout(this.timer)

		var interval = this.getSongInterval();
		if (interval < 0) {
			return;
		}

		this.timer = setTimeout(() => {
			this.getSong()
		}, interval + 100)


	}

}


