[![npm version](https://img.shields.io/npm/v/eslint-plugin-pug.svg?style=flat)](https://www.npmjs.org/package/eslint-plugin-pug)
[![npm downloads](https://img.shields.io/npm/dm/eslint-plugin-pug.svg?style=flat)](https://www.npmjs.org/package/eslint-plugin-pug)
[![Build Status](https://img.shields.io/travis/myfreeweb/eslint-plugin-pug.svg?style=flat)](https://travis-ci.org/myfreeweb/eslint-plugin-pug)
[![Unlicense](https://img.shields.io/badge/un-license-green.svg?style=flat)](http://unlicense.org)

# eslint-plugin-pug

An [ESLint] plugin for linting inline scripts in [Pug] files (formerly Jade)!

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

By participating in this project you agree to follow the [Contributor Code of Conduct](http://contributor-covenant.org/version/1/4/) and to release your contributions under the Unlicense.

[The list of contributors is available on GitHub](https://github.com/myfreeweb/eslint-plugin-pug/graphs/contributors).

## License

This is free and unencumbered software released into the public domain.  
For more information, please refer to the `UNLICENSE` file or [unlicense.org](http://unlicense.org).
