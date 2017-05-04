
// API:        https://jasmine.github.io/api/edge/global
// Quickstart: https://jasmine.github.io/edge/node.html

// npm init
// jasmine spec\coinkeySpec.js

describe("CoinKey", function(){
	// Helper libraries
	var random   = require("secure-random");
	var coininfo = require("coininfo")

	// Test fixtures from original repo
	var fixtures = require("../test/fixtures/coinkey");

	// Object under test + instance var
	var CoinKey = require("../lib/coinkey.js");
	var ck 

	describe("constructor", function(){
		
		// Test illegal constructor calls, they should complain
		// about the privateKey

		it("should fail without privateKey", function(){
			expect(function(){ 
				new CoinKey(); 
			})
			.toThrowError(/privateKey/i)
		})
		it("should fail with invalid privateKey", function(){
			expect(function(){ 
				new CoinKey("?!"); 
			})
			.toThrowError(/privateKey/i)
		})

		// Test with valid parameters. This is still considered constructor
		// duty, as it should initialize fields correctly

		describe("with valid privateKey", function(){
			var key

			beforeEach(function() {
				key = random.randomBuffer(32);
				ck  = new CoinKey(key);
			});

			it("should create compressed ECKey", function(){
				expect(ck.compressed).toBeTruthy()
			})

			it("should have default versions set", function(){
				expect(ck.versions).toBeDefined();

				expect(ck.versions.public).toBeDefined();
				expect(ck.versions.private).toBeDefined();
			})
		})

		// Create descriptions for each fixtures we have
		fixtures.valid.forEach(function(data) {
			var name = data.description

			describe("with valid currency versions for '" + name + "'", function(){
				beforeEach(function(){
					ck = new CoinKey(
						new Buffer(data.privateKey, "hex"),
						coininfo(data.unit)
					)
				})

				it("should have proper address", function(){
					expect(ck.publicAddress).toEqual(data.publicAddressCompressed);
				})

				it("should have proper WIF", function(){
					expect(ck.privateWif).toEqual(data.privateWifCompressed);	
				})
			})
		})
	})

	// These cases are dependent on currency type
	fixtures.valid.forEach(function(data) {
		describe("with currency '" + data.description + "' :", function(){
			beforeEach(function() {
				ck = new CoinKey(new Buffer(data.privateKey, "hex"), data.versions);
			});

			it(".privateWif should match", function(){
				expect(ck.privateWif).toEqual(data.privateWifCompressed);
			})

			it(".publicAddress should match", function(){
				expect(ck.publicAddress).toEqual(data.publicAddressCompressed)
			})
		})
	})

})

/*
describe("Player", function() {
	var Player = require('../../lib/jasmine_examples/Player');
	var Song = require('../../lib/jasmine_examples/Song');
	var player;
	var song;

	beforeEach(function() {
		player = new Player();
		song = new Song();
	});

	it("should be able to play a Song", function() {
		player.play(song);
		expect(player.currentlyPlayingSong).toEqual(song);

		//demonstrates use of custom matcher
		expect(player).toBePlaying(song);
	});

	describe("when song has been paused", function() {
		beforeEach(function() {
			player.play(song);
			player.pause();
		});

		it("should indicate that the song is currently paused", function() {
			expect(player.isPlaying).toBeFalsy();

			// demonstrates use of 'not' with a custom matcher
			expect(player).not.toBePlaying(song);
		});

		it("should be possible to resume", function() {
			player.resume();
			expect(player.isPlaying).toBeTruthy();
			expect(player.currentlyPlayingSong).toEqual(song);
		});
	});

	// demonstrates use of spies to intercept and test method calls
	it("tells the current song if the user has made it a favorite", function() {
		spyOn(song, 'persistFavoriteStatus');

		player.play(song);
		player.makeFavorite();

		expect(song.persistFavoriteStatus).toHaveBeenCalledWith(true);
	});

	//demonstrates use of expected exceptions
	describe("#resume", function() {
		it("should throw an exception if song is already playing", function() {
			player.play(song);

			expect(function() {
				player.resume();
			}).toThrowError("song is already playing");
		});
	});
});
*/
