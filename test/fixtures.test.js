const _ = require('lodash')
const { ESLint, Linter } = require('eslint')
const { preprocess, postprocess } = require('../utils')
const fsPromises = require('fs').promises
const path = require('path')

function objSortKey (obj) {
  if (_.isArray(obj)) return _.map(obj, objSortKey)
  if (!_.isPlainObject(obj)) return obj
  const grp = _.groupBy(_.toPairs(obj), pair => (_.isArray(pair[1]) || _.isPlainObject(pair[1])) ? 'b' : 'a')
  _.each(grp.b, v => { v[1] = objSortKey(v[1]) })
  return _.fromPairs([..._.sortBy(grp.a, '0'), ..._.sortBy(grp.b, '0')])
}

async function readPugFixture (fixture) {
  const filePath = path.join(__dirname, `./fixtures/${fixture}.pug`)
  const code = await fsPromises.readFile(filePath, { encoding: 'utf8' })
  return code.replace(/\r?\n/g, '\n')
}

describe('snapshot unit test', () => {
  let debug = { failed: true }

  afterEach(() => {
    if (debug.failed) console.log(JSON.stringify(objSortKey(debug)))
    debug = { failed: true }
  })

  test.each([
    // https://eslint.org/docs/developer-guide/nodejs-api#cliengine
    ['semi', 'semi', { env: { es2022: true }, rules: { semi: ['error', 'always'] } }],
    ['semi2', 'semi2', { env: { es2022: true }, rules: { semi: ['error', 'never'] } }],
    ['simple', 'simple', { env: { es2022: true }, rules: { 'no-console': ['error', { allow: ['warn', 'error'] }] } }],
    ['indent-setting', 'indent-setting', { env: { es2022: true }, rules: { indent: ['error', 2] } }],
    // ['standard', 'standard', {
    //   env: { es2022: true },
    //   extends: 'standard',
    //   rules: {
    //     'eol-last': ['error', 'never'],
    //   }
    // }],
    ['error-at-the-beginning', 'error-at-the-beginning', {
      env: { es2022: true },
      rules: {
        'max-lines': ['error', { max: 1 }],
        'max-len': ['error', { code: 35 }]
      }
    }],
    ['code', 'code', { env: { es2022: true }, rules: { semi: ['error', 'always'] } }],
    ['include-js', 'include-js', { env: { es2022: true }, rules: { semi: ['error', 'always'] } }],
  ])('linter.verify with fixture %s.pug', async (fixture, snapshot, config) => {
    debug = { ...debug, fixture, snapshot, config }
    expect.hasAssertions()
    const expected = require(`./fixtures/${snapshot}.json`)

    const linter = new Linter()
    const code = await readPugFixture(fixture)
    debug.messages = linter.verify(code, config, {
      filename: `${fixture}.pug`,
      postprocess,
      preprocess,
    })

    expect(debug.messages).toMatchObject(expected)
    debug.failed = false
  })

  test.each([
    ['semi', 'semi-fix', { env: { es6: true }, rules: { semi: ['error', 'always'] } }],
    ['semi2', 'semi2-fix', { env: { es6: true }, rules: { semi: ['error', 'never'] } }],
    ['string-interpolation', 'string-interpolation', { env: { es6: true }, rules: { semi: ['error', 'always'] } }],
    ['multiline', 'multiline', {
      env: { es6: true },
      extends: 'standard',
      rules: {
        'eol-last': ['error', 'never'],
      }
    }],
  ])('linter.verifyAndFix with %s.pug', async (fixture, snapshot, config) => {
    debug = { ...debug, fixture, snapshot, config }
    expect.hasAssertions()
    const expected = require(`./fixtures/${snapshot}.json`)

    const linter = new Linter()
    const code = await readPugFixture(fixture)
    debug.messages = linter.verifyAndFix(code, config, {
      filename: `${fixture}.pug`,
      postprocess,
      preprocess,
    })

    expect(debug.messages).toMatchObject(expected)
    debug.failed = false
  })

  test.each([
    ['standard', 'standard', {
      env: { es2022: true },
      extends: 'standard',
      plugins: ['pug'],
      rules: { 'eol-last': ['error', 'never'] },
    }],
  ])('eslint.lintText with fixture %s.pug', async (fixture, snapshot, config) => {
    debug = { ...debug, fixture, snapshot, config }
    expect.hasAssertions()
    const expected = require(`./fixtures/${snapshot}.json`)

    const eslint = new ESLint({
      cwd: __dirname,
      overrideConfig: config,
      useEslintrc: false,
    })
    const filePath = path.join(__dirname, `./fixtures/${fixture}.pug`)
    const code = await readPugFixture(fixture)
    ;[debug.results] = await eslint.lintText(code, { filePath })

    expect(debug.results.messages).toMatchObject(expected)
    debug.failed = false
  })
})
