const utils = require('../utils')

test.each([
  [0, { line: 1, column: 1 }],
  [29, { line: 3, column: 3 }],
  [60, { line: 7, column: 3 }],
])('offsetToPosition(%d) = %j', (position, expected) => {
  const src = "console.log({\n  dot: 'ted'\n})\n\nconsole.log({\n  dot: 'ted'\n})"
  const result = utils.offsetToPosition(src, position)
  expect(result).toEqual(expected)
})

test.each([
  [{ line: 1, column: 1 }, 0],
  [{ line: 3, column: 3 }, 29],
  [{ line: 7, column: 3 }, 60],
])('positionToOffset(%j) = %d', (offset, expected) => {
  const src = "console.log({\n  dot: 'ted'\n})\n\nconsole.log({\n  dot: 'ted'\n})"
  const result = utils.positionToOffset(src, offset)
  expect(result).toEqual(expected)
})

test.each([
  [1, [5, 8], true, [5, 9]],
  [1, [6, 7], false, [6, 1]],
  [15, [5, 8], true, [5, 23]],
])('originalPosition(%j, %j, %j) = %j', (column, orig, indentStart, expected) => {
  const result = utils.originalPosition(column, orig, indentStart)
  expect(result).toEqual(expected)
})

test.each([
  ['1\n2', '  ', '1\n  2'],
  ['1\n2\n3', '  ', '1\n  2\n  3'],
  ['1\n2\n3', '  | ', '1\n  | 2\n  | 3'],
  ['12', '  ', '12'],
])('addIndentAfterLf(%j, %j) = %j', (text, indent, expected) => {
  const result = utils.addIndentAfterLf(text, indent)
  expect(result).toEqual(expected)
})
