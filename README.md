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
			"song": "Mr. Brightside",
			"artist": "The Killers",
			"external_id": 24716739,
			"nerve_id": 7084,
			"album_art": "https://i.scdn.co/image/ac68a9e4a867ec3ce8249cd90a2d7c73755fb487" | null,
			"external_urls": {
				"spotify": "https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp"
			} | null
		},
		"currentShow": {
			"dayOfTheWeek": "friday",
			"showName": "Best Of The Playlist",
			"showPresenters": "Insanity Radio"
		},
		"now": "2017-04-28T00:45:14+0100"
	}

`external_id` and `nerve_id` can be empty or missing - they're Insanity-specific metadata. 

The second is InsanityStreamAPI. That uses Nchan (an NGINX module) that can push realtime updates to thousands of clients at a time. Individual data chunks are the same format as above. 

