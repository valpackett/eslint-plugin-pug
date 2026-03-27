import stylistic from '@stylistic/eslint-plugin'
import { ESLint } from 'eslint'
import fsPromises from 'fs/promises'
import globals from 'globals'
import _ from 'lodash'
import { fileURLToPath } from 'node:url'
import path from 'path'
import pluginPug from '../index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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

async function readJsonFixture (filepath) {
  const filePath = path.join(__dirname, `./fixtures/${filepath}.json`)
  const code = await fsPromises.readFile(filePath, { encoding: 'utf8' })
  return JSON.parse(code)
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
    ['error-at-the-beginning', 'error-at-the-beginning', {
      rules: {
        'max-lines': ['error', { max: 1 }],
        'max-len': ['error', { code: 35 }],
      }
    }],
    ['code', 'code', { rules: { semi: ['error', 'always'] } }],
    ['include-js', 'include-js', { rules: { semi: ['error', 'always'] } }],
  ])('eslint.lintText with fixture %s.pug', async (fixture, snapshot, config) => {
    debug = { ...debug, fixture, snapshot, config }
    expect.hasAssertions()
    const expected = await readJsonFixture(snapshot)

    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [
        {
          files: ['**/*.pug', '**/*.jade'], // apply processor to .jade, .pug files
          plugins: {
            pug: pluginPug,
          },
          processor: 'pug/pug',
        },
        {
          languageOptions: { globals: globals.es2022 },
          rules: config.rules,
        },
      ]
    })
    ;[debug.results] = await eslint.lintText(await readPugFixture(fixture), { filePath: `${fixture}.pug` })

    expect(debug.results.messages).toMatchObject(expected)
    debug.failed = false
  })

  test.each([
    ['semi', 'semi-fix', { rules: { semi: ['error', 'always'] } }],
    ['semi2', 'semi2-fix', { rules: { semi: ['error', 'never'] } }],
    ['string-interpolation', 'string-interpolation', { rules: { semi: ['error', 'always'] } }],
    ['multiline', 'multiline', { rules: { '@stylistic/eol-last': ['error', 'never'] } }],
  ])('eslint.lintText autofix with %s.pug', async (fixture, snapshot, config) => {
    debug = { ...debug, fixture, snapshot, config }
    expect.hasAssertions()
    const expected = await readJsonFixture(snapshot)

    const eslint = new ESLint({
      fix: true,
      overrideConfigFile: true,
      overrideConfig: [
        {
          files: ['**/*.pug', '**/*.jade'], // apply processor to .jade, .pug files
          plugins: {
            pug: pluginPug,
          },
          processor: 'pug/pug',
        },
        {
          plugins: {
            '@stylistic': stylistic,
          },
          languageOptions: { globals: globals.es2022 },
          rules: config.rules,
        },
      ]
    })
    debug.results = await eslint.lintText(await readPugFixture(fixture), { filePath: `${fixture}.pug` })

    expect(debug.results?.[0]).toMatchObject(expected)
    debug.failed = false
  })
})
