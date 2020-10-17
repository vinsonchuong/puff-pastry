# puff-pastry
[![npm](https://img.shields.io/npm/v/puff-pastry.svg)](https://www.npmjs.com/package/puff-pastry)
[![CI Status](https://github.com/vinsonchuong/puff-pastry/workflows/CI/badge.svg)](https://github.com/vinsonchuong/puff-pastry/actions?query=workflow%3ACI)
[![dependencies Status](https://david-dm.org/vinsonchuong/puff-pastry/status.svg)](https://david-dm.org/vinsonchuong/puff-pastry)
[![devDependencies Status](https://david-dm.org/vinsonchuong/puff-pastry/dev-status.svg)](https://david-dm.org/vinsonchuong/puff-pastry?type=dev)

Scaffolding for CLI tools

## Usage
Install [puff-pastry](https://www.npmjs.com/package/puff-pastry)
by running:

```sh
yarn add puff-pastry
```

Use it to create command-line executables like so:

```js
#!/usr/bin/env node
import run from 'puff-pastry'

run('./cli.mjs', {
  flags: ['--loader', 'hot-esm']
})
```

```js
export default async function({cwd, env, argv, log}) {
  log('Hello World!')
}
```

`run()` takes the path to a CLI entry function and calls it with an object
containing:

- `cwd`: The current working directory
- `env`: An object containing the environment variables
- `argv`: The command-line arguments
- `stdout`: A stream that writes to STDOUT
- `stderr`: A stream that writes to STDERR

Encapsulating a CLI into a function that takes arguments instead of relying on
the `process` global object allows for:

- Easier unit testing
- Easier composition of CLI tools from JavaScript
