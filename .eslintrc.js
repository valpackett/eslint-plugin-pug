module.exports = {
  root: true,
  env: {
    commonjs: true,
    jest: true,
    node: true,
  },
  extends: [
    'standard'
  ],
  rules: {
    'comma-dangle': ['error', 'only-multiline'],
  },
}
