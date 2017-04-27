# <img src="https://raw.githubusercontent.com/InsanityRadio/OnAirController/master/doc/headphones_dark.png" align="left" height=48 /> Web Player

This is a Cordova-based application for playing an Icecast stream. 

Specifically, Cordova-TypeScript-WebPack.

## Modifying

At some point all the configuration options will be moved to a single file. Until this is the case, you have to go diving for the stream URL etc.

The stream URL is in `player.ts`, and the metadata URL is in `metadata.ts` and `radio.ts`. 

## Installation

Firstly, `npm install` to install all the node modules you need.

Run `webpack`. Then copy the `www` directory to your web server. 

## Metadata

There are currently two metadata libraries. The first is plain JSON (name InsanityAPI) that looks like this:

	{
		"nowPlaying": {
			"song": "They Can't Take That Away From Me",
			"artist": "Fred Astaire",
			"external_id": 24716739,
			"nerve_id": 7084,
			"album_art": null
		},
		"currentShow": {
			"dayOfTheWeek": "friday",
			"showName": "Best Of The Playlist",
			"showPresenters": "Insanity Radio"
		},
		"now": "2017-04-28T00:45:14+0100"
	}

The second is InsanityStreamAPI. That uses Nchan (an NGINX module) that can push realtime updates to thousands of clients at a time. Individual data chunks are the same format as above. 

