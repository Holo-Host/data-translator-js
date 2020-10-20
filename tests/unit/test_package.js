const path				= require('path');
const log				= require('@whi/stdlog')(path.basename( __filename ), {
    level: process.env.LOG_LEVEL || 'fatal',
});

const expect				= require('chai').expect;

const hhdt				= require('../../src/index.js');
const { Package }			= hhdt;


const success_msg			= JSON.stringify({
    "response_id": "QmV1NgkXFwromLvyAmASN7MbgLtgUaEYkozHPGUxcHAbSL",
    "type": "success",
    "payload": true,
});
const holo_error_msg			= JSON.stringify({
    "type": "error",
    "payload": {
	"source": "HoloError",
	"error": "InstanceNotRunningError",
	"message": "Holochain instance is not active yet",
	"stack": [],
    },
});

class InstanceNotRunningError extends Error {}

function create_tests () {
    it("should create success package", async () => {
	const pack			= new Package( true, {
	    "response_id": "QmV1NgkXFwromLvyAmASN7MbgLtgUaEYkozHPGUxcHAbSL",
	});

	expect( pack.value()		).to.be.true;
	expect( pack.toJSON()		).to.deep.equal( JSON.parse(success_msg) );
    });

    it("should create error package", async () => {
	const pack			= Package.createFromError( "HoloError", new InstanceNotRunningError("Holochain instance is not active yet") );

	expect( pack.value()		).to.be.an("error");

	const json			= pack.toJSON();
	json.payload.stack		= [];
	expect( json			).to.deep.equal( JSON.parse(holo_error_msg) );
    });
}

function parse_tests () {
    it("should parse JSON into success package", async () => {
	const pack			= hhdt.parse( success_msg );

	expect( pack.value()		).to.be.true;
    });

    it("should parse JSON into error package", async () => {
	const pack			= hhdt.parse( holo_error_msg );
	const error			= pack.value();
	expect( error			).to.be.an("error");

	let test			= () => {
	    throw error;
	};
	expect( test			).to.throw( hhdt.sources.HoloError, "instance is not active" );
    });
}

describe("Package", () => {

    describe("create", create_tests );
    describe("parse", parse_tests );

});
