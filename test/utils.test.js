const _ = require('lodash')
const utils = require('../utils')

test.each([
  [1, [5, 8], true, [5, 9]],
  [1, [6, 7], false, [6, 1]],
  [15, [5, 8], true, [5, 23]],
])('originalPoint(%j, %j, %j) = %j', (column, orig, indentStart, expected) => {
  const result = utils.originalPoint(column, orig, indentStart)
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

describe('LineCol', () => {
  test.each([
    ['should return `0` for invalid input', {}, 0],
    ['should return `11` for out of bounds input', { line: 4, column: 2 }, 11],
    ['should return an offset (#1)', { line: 2, column: 2 }, 5],
    ['should return an offset (#2)', { line: 1, column: 1 }, 0],
    ['should return an offset (#3)', { line: 3, column: 4 }, 11],
  ])('toOffset %s', (name, input, output) => {
    const lineCol = new utils.LineCol('foo\nbar\nbaz')
    const actual = lineCol.toOffset(input)
    expect(actual).toBe(output)
  })

  test.each([
    [{ line: 1, column: 1 }, 0],
    [{ line: 3, column: 3 }, 29],
    [{ line: 7, column: 3 }, 60],
  ])('toOffset(%j) = %d', (input, output) => {
    const lineCol = new utils.LineCol("console.log({\n  dot: 'ted'\n})\n\nconsole.log({\n  dot: 'ted'\n})")
    const actual = lineCol.toOffset(input)
    expect(actual).toBe(output)
  })

  test.each([
    ['should return first point for invalid input', -1, { line: 1, column: 1, offset: 0 }],
    ['should return last point for out of bounds input', 12, { line: 3, column: 4, offset: 11 }],
    ['should return a point (#1)', 0, { line: 1, column: 1, offset: 0 }],
    ['should return a point (#2)', 11, { line: 3, column: 4, offset: 11 }],
  ])('toPoint %s', (name, input, output) => {
    const lineCol = new utils.LineCol('foo\nbar\nbaz')
    const actual = lineCol.toPoint(input)
    expect(actual).toMatchObject(output)
  })

  test.each([
    [0, { line: 1, column: 1 }],
    [29, { line: 3, column: 3 }],
    [60, { line: 7, column: 3 }],
  ])('toPoint(%d) = %j', (input, output) => {
    const lineCol = new utils.LineCol("console.log({\n  dot: 'ted'\n})\n\nconsole.log({\n  dot: 'ted'\n})")
    const actual = lineCol.toPoint(input)
    expect(actual).toMatchObject(output)
  })

  test.each([
    [10, { line: 1, column: 11 }],
    [20, { line: 2, column: 8 }],
  ])('toPoint(%d) = %j', (input, output) => {
    const lineCol = new utils.LineCol('counter = 0;\ncounter = 5')
    const actual = lineCol.toPoint(input)
    expect(actual).toMatchObject(output)
  })
})

describe('preprocess', () => {
  test.each([
    ['eol = lf', 'script.\n  counter = 0\n  counter = 5', 'counter = 0\ncounter = 5'],
    ['eol = crlf', 'script.\r\n  counter = 0\r\n  counter = 5', 'counter = 0\r\ncounter = 5'],
  ])('%j', (name, input, output) => {
    const actual = utils.preprocess(input, '0.pug')
    expect(_.get(actual, '0.text')).toEqual(output)
  })
})
