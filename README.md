[![npm version](https://img.shields.io/npm/v/eslint-plugin-pug.svg?style=flat)](https://www.npmjs.org/package/eslint-plugin-pug)
[![npm downloads](https://img.shields.io/npm/dm/eslint-plugin-pug.svg?style=flat)](https://www.npmjs.org/package/eslint-plugin-pug)
[![Build Status](https://github.com/valpackett/eslint-plugin-pug/workflows/Node.js%20CI/badge.svg)](https://github.com/valpackett/eslint-plugin-pug/actions)
[![Unlicense](https://img.shields.io/badge/un-license-green.svg?style=flat)](https://unlicense.org)

# eslint-plugin-pug

An [ESLint] plugin for linting inline scripts in [Pug] files!

Only extracts `script` tags with no type or `text/javascript` type.

See also: [eslint-plugin-html].

[ESLint]: https://eslint.org
[Pug]: https://pugjs.org
[eslint-plugin-html]: https://github.com/BenoitZugmeyer/eslint-plugin-html

## Installation

Install with [npm], obviously:

```bash
npm install --save-dev eslint eslint-plugin-pug
```

### eslint v9 and above

And add to your [ESLint configuration] -- `eslint.config.js`:

```js
// eslint.config.js
import { defineConfig } from 'eslint/config';
import pug from 'eslint-plugin-pug';

export default defineConfig([
  // ... other configs
  {
    name: 'eslint-plugin-pug/processor',
    files: ['**/*.pug', '**/*.jade'], // apply processor to .pug, .jade files
    plugins: { pug },
    processor: 'pug/pug',
  },
  {
    name: 'eslint-plugin-pug/rules',
    files: ['**/*.pug.mjs', '**/*.pug.js'], // apply rules to virtual .pug.mjs, .pug.js files created by the processor
    rules: {
      '@stylistic/eol-last': ['error', 'never'],
      // ... other rules
    },
  },
]);
```

### eslint v8 and below

And add to your [ESLint configuration] -- `.eslintrc` or `eslintConfig` in `package.json`:

```json
{
  "plugins": [
    "pug"
  ]
}
```

[npm]: https://www.npmjs.com
[ESLint configuration]: https://eslint.org/docs/user-guide/configuring

## Contributing

Please feel free to submit pull requests!

By participating in this project you agree to follow the [Contributor Code of Conduct](https://contributor-covenant.org/version/1/4/) and to release your contributions under the Unlicense.

## License

This is free and unencumbered software released into the public domain.  
For more information, please refer to the `UNLICENSE` file or [unlicense.org](https://unlicense.org).
