const VALID_SOURCES = [ "HoloError", "UserError", "AppError" ];

class DynamicError extends Error {
    constructor( name, message, stack = [] ) {
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

	if ( stack.length === 0 ) {
	    if (typeof Error.captureStackTrace === 'function') {
		Error.captureStackTrace(this, this.constructor);
	    } else {
		this.stack              = (new Error(message)).stack;
	    }
	} else {
	    this.stack                  = stack.join("\n");
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
	    "stack": this.stack.split("\n"),
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



class Package {

    static createFromError ( source, err ) {
	// TODO: validate err instanceof Error
	return new Package({
	    "source": source,
	    "error": err.constructor.name,
	    "message": err.message,
	    "stack": err.stack.split("\n"),
	}, {
	    "type": "error",
	});
    }

    constructor ( payload, opts = {} ) {
	this.payload			= payload

	// TODO: validate options
	this.type			= opts.type || "success";
	this.response_id		= opts.response_id;
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
	const pack			= {
	    "type": this.type,
	    "payload": this.payload,
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
	    // TODO: validate error payload
	    return new Package( data.payload, {
		"type": data.type,
	    });
	}
	else
	    throw TypeError(`Unknown package type '${data.type}'`);
    },
};
