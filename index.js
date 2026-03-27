const utils = require('./utils')
const pkg = require('./package.json')

const processor = {
  meta: {
    name: `eslint-processor-pug`,
    version: pkg.version,
  },
  preprocess: utils.preprocess,
  postprocess: utils.postprocess,
  supportsAutofix: true,
}

module.exports = {
  meta: {
    name: pkg.name,
    version: pkg.version,
  },
  processors: {
    '.jade': processor,
    '.pug': processor,
    'pug': processor,
  }
}
