const _ = require('lodash')
const CLIEngine = require('eslint').CLIEngine
const path = require('path')
const plugin = require('../')

function execute (filename, baseConfig = {}, fix = false) {
  // set default config
  _.set(baseConfig, 'rules.linebreak-style', ['error', 'unix'])
  const options = {
    baseConfig,
    envs: ['browser'],
    plugins: ['pug'],
    useEslintrc: false,
    fix,
  }

  const cli = new CLIEngine(options)
  cli.addPlugin('eslint-plugin-pug', plugin)
  const file = path.join(__dirname, 'fixtures', filename)
  const results = _.get(cli.executeOnFiles([file]), 'results.0')
  return fix ? results : _.get(results, 'messages')
}

test.each([
  // https://eslint.org/docs/developer-guide/nodejs-api#cliengine
  ['semi', 'semi', { rules: { semi: ['error', 'always'] } }],
  ['simple', 'simple', { rules: { 'no-console': ['error', { allow: ['warn', 'error'] }] } }],
  ['indent-setting', 'indent-setting', { rules: { indent: ['error', 2] } }],
  ['standard', 'standard', {
    extends: 'standard',
    rules: {
      'eol-last': ['error', 'never'],
    }
  }],
  ['error-at-the-beginning', 'error-at-the-beginning', {
    rules: {
      'max-lines': ['error', { max: 1 }],
      'max-len': ['error', { code: 35 }]
    }
  }],
  ['code', 'code', { rules: { semi: ['error', 'always'] } }],
])('lint %s toEqual snapshot %s.json with baseConfig %j', (filename, snapshot, config) => {
  expect.hasAssertions()
  const messages = execute(`${filename}.pug`, config)
  const expected = require(`./fixtures/${snapshot}.json`)
  expect(messages).toEqual(expected)
})

test.each([
  ['semi', 'semi-fix', { rules: { semi: ['error', 'always'] } }],
  ['string-interpolation', 'string-interpolation', { rules: { semi: ['error', 'always'] } }],
  ['multiline', 'multiline', {
    extends: 'standard',
    rules: {
      'eol-last': ['error', 'never'],
    }
  }],
])('lint %s.pug toMatchObject snapshot %s.json with baseConfig %j', (filename, snapshot, config) => {
  expect.hasAssertions()
  const messages = execute(`${filename}.pug`, config, true)
  const expected = require(`./fixtures/${snapshot}.json`)
  expect(messages).toMatchObject(expected)
})
