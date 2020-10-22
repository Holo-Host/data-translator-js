const VALID_SOURCES = [ "HoloError", "UserError", "AppError" ];

class DynamicError extends Error {
    constructor( name, message, stack ) {
	super( message );

	Object.defineProperty( this, "source", {
	    "value": this.name,
	    writable: false,
	});
	Object.defineProperty( this.constructor, "name", {
	    "value": name,
	    writable: false,
	});
	Object.defineProperty( this, "name", {
	    "value": name,
	    writable: false,
	});

	if ( Array.isArray( stack ) ) {
	    this.stack                  = stack.join("\n");
	}
	else if ( typeof stack === "string" ) {
	    this.stack			= stack;
	}
	else if ( stack === undefined ) {
	    if (typeof Error.captureStackTrace === 'function') {
		Error.captureStackTrace(this, this.constructor);
	    } else {
		this.stack              = (new Error(message)).stack;
	    }
	}
	else if ( stack === null ) {
	    this.stack			= "";
	}
	else {
	    throw new TypeError(`Invalid 'stack' value: ${stack}`);
	}
    }

    toString () {
	return this.name + ": " + this.message;
    }

    [Symbol.toPrimitive] ( hint ) {
	return this.toString();
    }

    toJSON () {
	return {
	    "source": this.source,
	    "name": this.name,
	    "message": this.message,
	    "stack": this.stack === "" ? [] : this.stack.split("\n"),
	};
    }

    valueOf () {
	return this.stack;
    }
}

const sources = {};
VALID_SOURCES.map(name => {
    sources[name] = class extends DynamicError {};
});


function assert_type( type, value, required = true ) {
    if ( required === false && value === undefined )
	return;
    if ( required === true && value === undefined )
	throw new TypeError(`Value is required`);

    switch (type) {
    case "string":
	if ( typeof value !== "string" )
	    throw new TypeError(`Value must be a string`);
	break;
    case "has_prototype":
	if ( value === null || value === undefined )
	    throw new TypeError(`Value cannot be null or undefined`);
	break;
    case "array":
	if ( !Array.isArray( value ) )
	    throw new TypeError(`Value must be an array`);
	break;
    default:
	throw new Error(`Unknown type '${type}'`);
	break;
    }
}


class Package {

    static createFromError ( source, err ) {
	assert_type( "string",		source );
	assert_type( "has_prototype",	err );
	assert_type( "has_prototype",	err.constructor );
	assert_type( "string",		err.constructor.name );
	assert_type( "string",		err.stack,	false );

	let name			= err.constructor.name;
	if ( name === "Object" ) {
	    assert_type( "string",	err.name );
	    name			= err.name;
	}

	return new Package({
	    "source": source,
	    "error": name,
	    "message": err.message,
	    "stack": err.stack ? err.stack.split("\n") : [],
	}, {
	    "type": "error",
	});
    }

    constructor ( payload, opts = {} ) {
	assert_type( "string",	opts.type,		false );
	assert_type( "string",	opts.response_id,	false );

	if ( ![undefined, "success", "error"].includes( opts.type ) )
	    throw new TypeError(`Invalid 'type' value: ${opts.type}`);

	this.type			= opts.type || "success";
	this.response_id		= opts.response_id;

	if ( this.type === "error" ) {
	    assert_type( "has_prototype",	payload );
	    assert_type( "string",		payload.source );

	    if ( !VALID_SOURCES.includes( payload.source ) )
		throw new TypeError(`Invalid 'source' value: ${payload.source}`);

	    assert_type( "string",		payload.error );
	    assert_type( "string",		payload.message );
	    assert_type( "array",		payload.stack,	false );

	    if ( payload.stack === undefined )
		payload.stack		= [];
	}

	this.payload			= payload
    }

    value () {
	if ( this.type === "success" )
	    return this.payload;
	else if ( this.type === "error" ) {
	    let { source,
		  error,
		  message,
		  stack }		= this.payload;
	    return new sources[source]( error, message, stack );
	}
    }

    toJSON () {
	let value;

	if ( this.type === "success" ) {
	    value			= this.value();
	    if ( ![null, undefined].includes( value ) && typeof value.toJSON === "function" )
		value			= value.toJSON();
	}
	else if ( this.type === "error" ) {
	    value			= this.payload;
	}

	const pack			= {
	    "type": this.type,
	    "payload": value,
	};

	if ( this.response_id !== undefined )
	    pack.response_id		= this.response_id;

	return pack;
    }

    toString () {
	return JSON.stringify( this.toJSON() );
    }
}


module.exports				= {
    sources,
    Package,
    parse ( msg ) {
	const data			= typeof msg === "string"
	      ? JSON.parse(msg)
	      : msg;

	if ( data.type === "success" ) {
	    return new Package( data.payload, {
		"response_id": data.response_id,
	    });
	}
	else if ( data.type === "error" ) {
	    return new Package( data.payload, {
		"type": data.type,
	    });
	}
	else
	    throw TypeError(`Unknown package type '${data.type}'`);
    },
};
