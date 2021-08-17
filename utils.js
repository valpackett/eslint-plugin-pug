const _ = require('lodash')
const pugLexer = require('pug-lexer')
const pugParser = require('pug-parser')
const pugWalk = require('pug-walk')

// https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/MIME_types
const JS_MIME = [
  'application/javascript',
  'application/ecmascript',
  'text/ecmascript',
  'text/javascript',
]

const context = {}

class LineCol {
  constructor (str) {
    this.parseString(str)
  }

  parseString (str) {
    str = _.toString(str)
    this.len = str.length
    this.indices = []
    const re = /\r?\n|\r/g
    while (re.test(str)) this.indices.push(re.lastIndex)
    this.indices.push(str.length + 1)
  }

  toPoint (offset) {
    if (offset < 0) return { line: 1, column: 1, offset: 0 }
    if (offset >= this.len) offset = this.len
    const found = _.findIndex(this.indices, v => v > offset)
    return { line: found + 1, column: offset - _.get(this, ['indices', found - 1], 0) + 1, offset }
  }

  toOffset (point) {
    const [line, column] = _.map(['line', 'column'], k => _.toSafeInteger(_.get(point, k, 0)))
    if (line < 1) return 0
    if (line > this.indices.length) return this.len
    return _.get(this, ['indices', line - 2], 0) + column - 1
  }
}

exports.LineCol = LineCol

exports.isJsNode = node => {
  if (node.type !== 'Tag' || node.name !== 'script') return false // not a script tag
  if (!node.block.nodes.length) return false // nodes empty
  let scriptType = 'text/javascript'
  _.each(node.attrs, attr => {
    if (attr.name === 'type' && _.isString(attr.val)) scriptType = _.trim(attr.val, '\'" ')
  })
  return _.includes(JS_MIME, _.toLower(scriptType))
}

exports.originalPoint = (column, orig, indentEnd = true) => {
  return [
    _.get(orig, 0), // line
    (indentEnd || column > 1) ? column + _.get(orig, 1) : column, // column
  ]
}

exports.parsePug = str => {
  return pugParser(pugLexer(str))
}

exports.nodesToOrigsAndText = (ctx, nodes) => {
  const origs = []
  const lines = []
  let lastLine = null
  _.each(nodes, (node, i) => {
    if (node.val === '\n' || node.line === lastLine) return
    lastLine = node.line
    origs.push([node.line, node.column - 1])
    const indexStart = ctx.linecol.toOffset(node)
    const indexEnd = ctx.linecol.toOffset({ line: node.line + 1, column: 1 })
    lines.push(ctx.src.substring(indexStart, indexEnd))
  })
  lines[lines.length - 1] = _.trimEnd(lines[lines.length - 1], '\r\n')
  return {
    origs,
    text: lines.join('')
  }
}

exports.preprocess = (src, filename) => {
  const ast = exports.parsePug(src)
  const ctx = context[filename] = { src, filename, linecol: new LineCol(src), blocks: [] }
  pugWalk(ast, node => {
    if (!exports.isJsNode(node)) return
    const { origs, text } = exports.nodesToOrigsAndText(ctx, node.block.nodes)
    // console.log('preprocess1 = ', JSON.stringify({ nodes: node.block.nodes, origs, src, text }))
    ctx.blocks.push({
      column: node.column,
      filename: '0.js',
      fixMultiline: node.line !== _.first(origs)[0],
      line: node.line,
      origs,
      text,
      linecol: new LineCol(text),
    })
    return false
  })
  // console.log('preprocess2 = ', JSON.stringify(ctx.blocks))
  return ctx.blocks
}

exports.addIndentAfterLf = (text, indent) => {
  return text.replace(/\r?\n|\r/g, eol => `${eol}${indent}`)
}

exports.transformFix = ({ msg, block, ctx }) => {
  const fix = _.cloneDeep(_.get(msg, 'fix'))
  if (!fix) return

  // because inline script (like `#[script console.log('test')]`) is very difficult to autofix with multiline, so skip
  if (!block.fixMultiline && _.find(_.get(fix, 'text'), '\n')) return

  // transform range: block offset -> block point -> original point -> original offset
  msg.orig = { range: fix.range, line: msg.line, column: msg.column, endLine: msg.endLine, endColumn: msg.endColumn }
  const start = block.linecol.toPoint(fix.range[0])
  const origStart = block.origs[start.line - 1]
  ;[start.line, start.column] = exports.originalPoint(start.column, origStart)

  const end = block.linecol.toPoint(fix.range[1])
  const origEnd = block.origs[end.line - 1] || [_.get(block, 'origs.0.0') + end.line - 1, 0]
  ;[end.line, end.column] = exports.originalPoint(end.column, origEnd)

  fix.range = [
    ctx.linecol.toOffset(start),
    ctx.linecol.toOffset(end),
  ]

  // add indent to multiline fix.text
  const head = ctx.linecol.toOffset({ line: origStart[0], column: origStart[1] + 1 })
  const indent = ctx.src.substring(head - origStart[1], head)
  // fix lines start with pipeline
  fix.text = fix.text.replace(/\r?\n|\r/g, eol => `${eol}${fix.text.substring(fix.range[0] - origStart[1], fix.range[0])}`)
  fix.text = exports.addIndentAfterLf(fix.text, indent)
  return fix
}

exports.postprocess = (messages, filename) => {
  // console.log('postprocess', JSON.stringify({ messages, ctx }, null, 2))
  const newMessages = []
  const ctx = context[filename]
  _.each(messages, (blockMsg, blockIdx) => {
    const block = ctx.blocks[blockIdx]
    _.each(blockMsg, msg => {
      // line and column origin
      ;[msg.line, msg.column] = exports.originalPoint(msg.column, block.origs[msg.line - 1])
      if (msg.endLine && msg.endColumn) {
        const origMsgEnd = block.origs[msg.endLine - 1] || [_.get(block, 'origs.0.0') + msg.endLine - 1, 0]
        ;[msg.endLine, msg.endColumn] = exports.originalPoint(msg.endColumn, origMsgEnd, false)
      }

      msg.fix = exports.transformFix({ msg, block, ctx })
      if (_.isNil(msg.fix)) delete msg.fix

      newMessages.push(msg)
    })
  })
  delete context[filename]
  return newMessages
}
