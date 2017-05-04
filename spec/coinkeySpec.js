
// API:        https://jasmine.github.io/api/edge/global
// Quickstart: https://jasmine.github.io/edge/node.html

// npm init
// jasmine spec\coinkeySpec.js

function expectToMatchFixture(ck, data, uncompressed){
	expect(ck.versions).toEqual({
		public:  data.versions.public,
		private: data.versions.private,
	});

	if (uncompressed){
		expect(ck.privateWif).toEqual(data.privateWif);
		expect(ck.publicAddress).toEqual(data.publicAddress);
	} else {
		expect(ck.privateWif).toEqual(data.privateWifCompressed);
		expect(ck.publicAddress).toEqual(data.publicAddressCompressed);
	}
}

describe("CoinKey", function(){
	// Helper libraries
	var random   = require("secure-random");
	var coininfo = require("coininfo")

	// Test fixtures from original repo
	var fixtures = require("../test/fixtures/coinkey");

    var bitcoin  = fixtures.valid.filter(function (f) { if (f.description.match(/bitcoin/ )){ return f; } })[0];
    var dogecoin = fixtures.valid.filter(function (f) { if (f.description.match(/dogecoin/)){ return f; } })[0];

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

		describe("with currency '" + data.description + "' :", function(){
			it(".fromWif should digest uncompressed data", function(){
				ck = CoinKey.fromWif(data.privateWif);

				expect(ck.compressed).toBeFalsy();
				expect(ck.versions).toEqual({
					public:  data.versions.public,
					private: data.versions.private,
				})
				expect(ck.privateKey.toString("hex")).toEqual(data.privateKey);
				expect(ck.publicAddress).toEqual(data.publicAddress);
			})
			
			it(".fromWif should digest compressed data", function(){
				ck = CoinKey.fromWif(data.privateWifCompressed);

				expect(ck.compressed).toBeTruthy();
				expect(ck.versions).toEqual({
					public:  data.versions.public,
					private: data.versions.private,
				})
				expect(ck.privateKey.toString("hex")).toEqual(data.privateKey);
				expect(ck.publicAddress).toEqual(data.publicAddressCompressed);
			})
		})
	})

	describe(".versions", function(){
		var A = bitcoin
		var B = dogecoin

        beforeEach(function(){
        	ck = new CoinKey(new Buffer(A.privateKey, "hex"))
        })

		describe("when object changes", function(){
			it("should change", function(){
				ck.versions = B.versions;

				expectToMatchFixture(ck, B);
			})
		})

		describe("when field changes", function(){
			it("should change", function(){
				ck.versions.public  = B.versions.public;
				ck.versions.private = B.versions.private;

				expectToMatchFixture(ck, B);
			})
		})
	})

	describe(".createRandom()", function(){
		describe("without versions", function(){
			it("should create a Bitcoin CoinKey", function(){
				ck = CoinKey.createRandom();
				
				expect(ck.versions).toEqual({
					public:  bitcoin.versions.public,
					private: bitcoin.versions.private,
				})
			})
		})

		// Test for each currency
		fixtures.valid.forEach(function(data) {
			describe("with currency '" + data.description + "' versions", function(){
				beforeEach(function(){
					ck = CoinKey.createRandom(data.versions);
				});

				it("should create a matching CoinKey", function(){
					expect(ck.versions).toEqual({
						public:  data.versions.public,
						private: data.versions.private,
					})
				})
			})
		})
	})

})
