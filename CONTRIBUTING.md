[back to README.md](README.md)

# Contributing
[![](https://img.shields.io/github/workflow/status/holo-host/data-translator-js/Node.js%20CI/develop?style=flat-square&label=develop)](https://github.com/holo-host/data-translator-js)


## Overview

### Intent
The goal of this library is to serialize/deserialize structured responses according to Holo's
[Structured Response Specification](https://github.com/Holo-Host/rfcs/blob/master/system-architecture/structured-response-specification.md)

### Rationale
We want to

1. reduce redundant code across Holo services
2. isolate architectural decisions
3. easily associate compatible implementations using NPM's semantic package versioning

### Constraints

- Minimize library size
  - Since this is used on the client side, we want the library to be as small as possible.  This
    means we want to avoid including any dependencies that don't justify their own size.

### Architecture
```
Content Layer                                           | HHDT          | success || error      |
                                                        | "Header"      |                       |
Context Layer                           | JSON-RPC      |---------------------------------------|
                                        | "Header"      |---------------------------------------|
Transport Layer         | TCP           |-------------------------------------------------------|
                        | Header        |-------------------------------------------------------|

Full packet             | TCP           | JSON-RPC      | HHDT          | Data                  |
                        | Header        | "Header"      | "Header"      |                       |
```

Each layer gives additional meaning (routing) to the data.

- **Tranport Layer** - gives our data a network path accross the internet.
- **Context Layer** - gives definition to who the data is for.
- **Content Layer** - gives definition to what the data means.


## Development

### Environment

- Developed using Node.js v12.16.3

### Building

- bundled by `webpack`

```
make dist
```

### Testing

To run all tests with logging
```
make test-debug
```

- `make test-unit-debug` - **Unit tests only**
- `make test-integration-debug` - **Integration tests only**

> **NOTE:** remove `-debug` to run tests without logging
