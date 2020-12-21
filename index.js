const utils = require('./utils')

const pugProcessor = {
  preprocess: utils.preprocess,
  postprocess: utils.postprocess,
  supportsAutofix: true
}

module.exports = {
  processors: {
    '.jade': pugProcessor,
    '.pug': pugProcessor
  }
}
