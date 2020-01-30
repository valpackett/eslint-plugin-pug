const utils = require('./utils')

var pugProcessor = {
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
