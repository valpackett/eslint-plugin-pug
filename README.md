# eslint-plugin-jade [![npm version](https://img.shields.io/npm/v/eslint-plugin-jade.svg?style=flat)](https://www.npmjs.org/package/eslint-plugin-jade) [![npm downloads](https://img.shields.io/npm/dm/eslint-plugin-jade.svg?style=flat)](https://www.npmjs.org/package/eslint-plugin-jade) [![Dependency Status](https://img.shields.io/gemnasium/myfreeweb/eslint-plugin-jade.svg?style=flat)](https://gemnasium.com/myfreeweb/eslint-plugin-jade) [![Unlicense](https://img.shields.io/badge/un-license-green.svg?style=flat)](http://unlicense.org)

An [ESLint] plugin for linting inline scripts in [Jade] files!

Only extracts `script` tags with no type or `text/javascript` type.

See also: [eslint-plugin-html].

[ESLint]: http://eslint.org
[Jade]: http://jade-lang.com
[eslint-plugin-html]: https://github.com/BenoitZugmeyer/eslint-plugin-html

## Installation

Install with [npm], obviously:

```bash
npm install --save-dev eslint eslint-plugin-jade
```

And add to your [ESLint configuration] -- `.eslintrc` or `eslintConfig` in `package.json`:

```json
{
  "plugins": [
    "jade"
  ]
}
```

[npm]: https://www.npmjs.com
[ESLint configuration]: http://eslint.org/docs/user-guide/configuring

## Contributing

Please feel free to submit pull requests!
Bugfixes and simple non-breaking improvements will be accepted without any questions :-)

By participating in this project you agree to follow the [Contributor Code of Conduct](http://contributor-covenant.org/version/1/2/0/).

## License

This is free and unencumbered software released into the public domain.  
For more information, please refer to the `UNLICENSE` file or [unlicense.org](http://unlicense.org).
