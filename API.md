[back to README.md](README.md)

# API Reference

## `new Package( payload, options = {}, metadata )`
Create a new instance of `Package`.

- `payload` - any value that can be converted to JSON
- `opts` - (*optional*) configurable values.  `null` or `undefined` will be interrpreted as empty config
  - `type` - (*optional*) can be [`success`, `error`]; defaults to `success`
- `metadata` - (*optional*) an object of key/value pairs that will be set as the package's metadata

#### Success example
```javascript
const pack = new Package( "I am a werewolf", null, {
    "constraints": [
        "when there is a full moon",
        "when it is night time",
    ],
});
```

#### Error example
```javascript
const err_pack = new Package( {
    "source": "UserError"
    "error": "TypeError",
    "message": "It broke",
    "stack": [ "at repl:1:49", ... ],
}, {
    "type": "error"
});
```

### `Package.createFromError( source, error )`
A shortcut for generating error packages out of any given instance of the `Error` class.

- `source` - a string value used as `source` in the payload
- `error` - an `Error` instance used to determine the other payload values (`error`, `message`, `stack`)

Returns the newly created package instance.

#### Error example
```javascript
const err_pack = Package.createFromError( "UserError", new TypeError("It broke") );
```


### `Package.metadata( key, value? )`
A method for getting and setting the package's metadata values.

- `key` - if `value` is present, get this metadata key; otherwise, set this key to `value`
- `value` - (*optional*) any value that can be converted to JSON.
  - a value of `undefined` will remove `key` from the package's metadata.

Returns the metadata value for the given `key`.  If the `key` was removed in this operation then the
deleted value is returned.

### `Package.value()`
Returns the translated payload value.

#### Success example
```javascript
pack.value()
// 'I am a werewolf'
```

#### Error example
```javascript
err_pack.value()
// TypeError: It broke
//     at repl:1:49
//     ...
```

### `Package.toJSON()`
Returns a JSON serializable object of the package.

#### Success example
```javascript
pack.toJSON()
// {
//     type: 'success',
//     payload: 'I am a werewolf',
//     metadata: {
//         constraints: [ 'when there is a full moon', 'when it is night time' ]
//     }
// }
```

#### Error example
```javascript
err_pack.toJSON()
// {
//     type: 'error',
//     payload: {
//         source: 'UserError',
//         error: 'TypeError',
//         message: 'It broke',
//         stack: [
//             'TypeError: It broke',
//             '    at repl:1:49',
//             ...
//         ]
//     }
// }
```

### `Package.toString()`
Returns a JSON string of the package.

#### Success example
```javascript
pack.toString()
// '{"type":"success","payload":"I am a werewolf","metadata":{"constraints":["when there is a full moon","when it is night time"]}}'
```

#### Error package
```javascript
err_pack.toString()
// '{"type":"error","payload":{"source":"UserError","error":"TypeError","message":"It broke","stack":["TypeError: It broke","    at repl:1:49", ...]}}'
```
