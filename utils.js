const _ = require('lodash')
const pugLexer = require('pug-lexer')
const pugParser = require('pug-parser')
const pugWalk = require('pug-walk')
const vfile = require('vfile')
const vfileLocation = require('vfile-location')

// https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/MIME_types
const JS_MIME = [
  'application/javascript',
  'application/ecmascript',
  'text/ecmascript',
  'text/javascript',
]

let ctx

exports.isJsNode = node => {
  if (node.type !== 'Tag' || node.name !== 'script') return false // not a script tag
  if (!node.block.nodes.length) return false // nodes empty
  let scriptType = 'text/javascript'
  _.each(node.attrs, attr => {
    if (attr.name === 'type' && _.isString(attr.val)) scriptType = _.trim(attr.val, '\'" ')
  })
  return _.includes(JS_MIME, _.toLower(scriptType))
}

exports.offsetToPosition = (src, offset) => {
  if (_.isString(src)) src = vfileLocation(vfile(src))
  const position = src.toPosition(offset)
  return _.pick(position, ['line', 'column'])
}

exports.positionToOffset = (src, pos) => {
  if (_.isString(src)) src = vfileLocation(vfile(src))
  const offset = src.toOffset(pos)
  return offset
}

exports.originalPosition = (column, orig, indentEnd = true) => {
  return [
    _.get(orig, 0), // line
    (indentEnd || column > 1) ? column + _.get(orig, 1) : column, // column
  ]
}

exports.parsePug = str => {
  return pugParser(pugLexer(str))
}

exports.preprocess = (src, filename) => {
  const ast = exports.parsePug(src)
  ctx = { src, filename, vfileLoc: vfileLocation(vfile(src)), blocks: [] }
  pugWalk(ast, node => {
    if (!exports.isJsNode(node)) return
    const lines = _.filter(node.block.nodes, n => n.val !== '\n')
    const text = _.map(lines, 'val').join('\n')
    ctx.blocks.push({
      column: node.column,
      filename: '0.js',
      fixMultiline: node.line !== _.get(node, 'block.nodes.0.line'),
      line: node.line,
      origs: _.map(lines, n => [n.line, n.column - 1]),
      text,
      vfileLoc: vfileLocation(vfile(text)),
    })
    return false
  })
  return ctx.blocks
}

exports.addIndentAfterLf = (text, indent) => {
  return text.replace(/\n/g, '\n' + indent)
}

exports.transformFix = ({ msg, block, ctx }) => {
  const fix = _.cloneDeep(_.get(msg, 'fix'))
  if (!fix) return

  // because inline script (like `#[script console.log('test')]`) is very difficult to autofix with multiline, so skip
  if (!block.fixMultiline && _.find(_.get(fix, 'text'), '\n')) return

  // transform range: block offset -> block position -> original position -> original offset
  const start = exports.offsetToPosition(block.vfileLoc, fix.range[0])
  const origStart = block.origs[start.line - 1]
  ;[start.line, start.column] = exports.originalPosition(start.column, origStart)

  const end = exports.offsetToPosition(block.vfileLoc, fix.range[1])
  ;[end.line, end.column] = exports.originalPosition(end.column, block.origs[end.line - 1])

  fix.range = [
    exports.positionToOffset(ctx.vfileLoc, start),
    exports.positionToOffset(ctx.vfileLoc, end),
  ]

  // add indent to multiline fix.text
  const head = exports.positionToOffset(ctx.vfileLoc, { line: origStart[0], column: origStart[1] })
  const indent = ctx.src.substring(head - origStart[1] + 1, head)
  fix.text = fix.text.replace(/\n/g, '\n' + fix.text.substring(fix.range[0] - origStart[1], fix.range[0]))
  fix.text = exports.addIndentAfterLf(fix.text, indent)
  return fix
}

exports.postprocess = (messages, filename) => {
  // console.log(JSON.stringify(ctx, null, 2))

  const newMessages = []
  _.each(messages, (blockMsg, blockIdx) => {
    const block = ctx.blocks[blockIdx]
    _.each(blockMsg, msg => {
      // line and column origin
      ;[msg.line, msg.column] = exports.originalPosition(msg.column, block.origs[msg.line - 1])
      if (msg.endLine && msg.endColumn) {
        ;[msg.endLine, msg.endColumn] = exports.originalPosition(msg.endColumn, block.origs[msg.endLine - 1], false)
      }

      msg.fix = exports.transformFix({ msg, block, ctx })
      if (_.isNil(msg.fix)) delete msg.fix

      newMessages.push(msg)
    })
  })
  return newMessages
}
