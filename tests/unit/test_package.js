const path				= require('path');
const log				= require('@whi/stdlog')(path.basename( __filename ), {
    level: process.env.LOG_LEVEL || 'fatal',
});

const expect				= require('chai').expect;

const hhdt				= require('../../src/index.js');
const { Package }			= hhdt;


const response_id			= "QmV1NgkXFwromLvyAmASN7MbgLtgUaEYkozHPGUxcHAbSL";
const success_msg			= JSON.stringify({
    "type": "success",
    "metadata": {
	response_id,
    },
    "payload": true,
});
const success_no_metadata_msg		= JSON.stringify({
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
	const pack			= new Package( true, {}, {
	    "response_id": response_id,
	});

	expect( pack.value()		).to.be.true;
	expect( pack.toJSON()		).to.deep.equal( JSON.parse(success_msg) );
    });

    it("should create success package and set metadata", async () => {
	const pack			= new Package( true );
	pack.metadata("response_id", response_id );

	expect( pack.value()		).to.be.true;
	expect( pack.toJSON()		).to.deep.equal( JSON.parse(success_msg) );

	const resp_id			= pack.metadata("response_id", undefined );

	expect( pack.value()		).to.be.true;
	expect( resp_id			).to.equal( response_id );
	expect( pack.toJSON()		).to.deep.equal( JSON.parse(success_no_metadata_msg) );
    });

    it("should create error package", async () => {
	const pack			= new Package({
	    "source": "HoloError",
	    "error": "InstanceNotRunningError",
	    "message": "Holochain instance is not active yet",
	    "stack": [],
	}, {
	    "type": "error"
	});

	expect( pack.value()		).to.be.an("error");
	expect( pack.toJSON()		).to.deep.equal( JSON.parse(holo_error_msg) );

	const err			= new InstanceNotRunningError("Holochain instance is not active yet");
	const from			= Package.createFromError( "HoloError", err );

	expect( from.value()		).to.be.an("error");

	const json			= from.toJSON();
	json.payload.stack		= [];
	expect( json			).to.deep.equal( JSON.parse(holo_error_msg) );

	const crafted			= Package.createFromError( "HoloError", {
	    "name": "InstanceNotRunningError",
	    "message": "Holochain instance is not active yet",
	});
	expect( crafted.value()		).to.be.an("error");
	expect( crafted.toJSON()	).to.deep.equal( JSON.parse(holo_error_msg) );
    });

    it("should fail to create success package", async () => {
	expect(() => {
	    new Package( true, { "type": null });
	}				).to.throw( TypeError, "Value must be a string" );
	expect(() => {
	    new Package( true, { "type": "invalid_string" });
	}				).to.throw( TypeError, "Invalid 'type' value: invalid_string" );
    });

    it("should fail to create error package", async () => {
	const valid_error		= new InstanceNotRunningError("Holochain instance is not active yet") ;

	expect(() => {
	    Package.createFromError( null, valid_error );
	}				).to.throw( TypeError, "Value must be a string" );
	expect(() => {
	    Package.createFromError( "Blablabla", valid_error );
	}				).to.throw( TypeError, "Invalid 'source' value: Blablabla" );
	expect(() => {
	    Package.createFromError( "HoloError", "not an error" );
	}				).to.throw( TypeError, "Value is required" );
    });
}

function parse_tests () {
    it("should parse JSON into success package", async () => {
	const pack			= hhdt.parse( success_msg );

	expect( pack.value()		).to.be.true;

	const preparsed			= hhdt.parse( JSON.parse(success_msg) );

	expect( preparsed.value()			).to.be.true;
	expect( preparsed.metadata("response_id")	).to.equal( response_id );
    });

    it("should parse JSON into error package", async () => {
	const pack			= hhdt.parse( holo_error_msg );
	const error			= pack.value();

	expect( error			).to.be.an("error");
	expect(() => {
	    throw error;
	}				).to.throw( hhdt.sources.HoloError, "instance is not active" );
    });

    it("should fail to parse invalid message", async () => {
	expect(() => {
	    hhdt.parse( null );
	}				).to.throw( TypeError, "Value cannot be null or undefined" );
	expect(() => {
	    hhdt.parse( "" );
	}				).to.throw( TypeError, "Invalid message format: expected JSON, not ''" );
	expect(() => {
	    hhdt.parse({
		"payload": true,
	    });
	}				).to.throw( TypeError, "Invalid content: missing 'type'" );
	expect(() => {
	    hhdt.parse({
		"type": "error",
		"payload": true,
	    });
	}				).to.throw( TypeError, "Invalid error format: Value is required" );
    });

    it("should fail to parse JSON into error package", async () => {
	const invalid_error_msg		= JSON.stringify({
	    "type": "error",
	    "payload": null,
	});
	expect(() => {
	    hhdt.parse( invalid_error_msg );
	}				).to.throw( TypeError, "Value cannot be null or undefined" );
    });
}

describe("Package", () => {

    describe("create", create_tests );
    describe("parse", parse_tests );

});
