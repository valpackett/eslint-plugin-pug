module.exports = {
  root: true,
  env: {
    commonjs: true,
    es6: true,
    jest: true,
    node: true
  },
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 2018
  },
  rules: {
    'comma-dangle': ['error', 'only-multiline'],
  },
}
