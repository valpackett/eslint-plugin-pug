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

function objSortKey (obj) {
  if (_.isArray(obj)) return _.map(obj, objSortKey)
  if (!_.isPlainObject(obj)) return obj
  const grp = _.groupBy(_.toPairs(obj), pair => (_.isArray(pair[1]) || _.isPlainObject(pair[1])) ? 'b' : 'a')
  _.each(grp.b, v => { v[1] = objSortKey(v[1]) })
  return _.fromPairs([..._.sortBy(grp.a, '0'), ..._.sortBy(grp.b, '0')])
}

describe('snapshot unit test', () => {
  let debug = { failed: true }

  afterEach(() => {
    if (debug.failed) console.log(JSON.stringify(objSortKey(debug)))
    debug = { failed: true }
  })

  test.each([
    // https://eslint.org/docs/developer-guide/nodejs-api#cliengine
    ['semi', 'semi', { rules: { semi: ['error', 'always'] } }],
    ['semi2', 'semi2', { rules: { semi: ['error', 'never'] } }],
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
  ])('lint %s toMatchObject snapshot %s.json with baseConfig %j', (filename, snapshot, config) => {
    debug = { ...debug, filename, snapshot, config }
    expect.hasAssertions()
    const messages = execute(`${filename}.pug`, config)
    debug.messages = messages
    const expected = require(`./fixtures/${snapshot}.json`)
    expect(messages).toMatchObject(expected)
    debug.failed = false
  })

  test.each([
    ['semi', 'semi-fix', { rules: { semi: ['error', 'always'] } }],
    ['semi2', 'semi2-fix', { rules: { semi: ['error', 'never'] } }],
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
    debug.messages = messages
    const expected = require(`./fixtures/${snapshot}.json`)
    expect(messages).toMatchObject(expected)
    debug.failed = false
  })
})
