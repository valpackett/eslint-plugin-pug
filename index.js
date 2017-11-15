'use strict'

var lexer = require('pug-lexer')
var parser = require('pug-parser')
var walkExtract = require('pug-walk-extract-text')

var extractions = []

function isValidScript (node) {
	return node.type === 'Tag' && node.name === 'script'
		&& node.attrs.filter(function (attr) { return attr.val.replace(/['"]/g, '') !== 'text/javascript' }).length <= 0
}

var pugProcessor = {
	preprocess: function (text, filename) {
		extractions = walkExtract(parser(lexer(text, {filename: filename}), {filename: filename}), text, isValidScript)
		return extractions.map(function (x) { return x.text })
	},
	postprocess: function (messages, filename) {
		var results = []
		messages.forEach(function (errors, idx) {
			errors.forEach(function (error) {
				var extraction = extractions[idx]
				error.line += extraction.line - 1
				error.column += extraction.indent
				if ('endLine' in error) {
					error.endLine += extraction.line - 1
				}
				if ('endColumn' in error) {
					error.endColumn += extraction.indent
				}
				results.push(error)
			})
		})
		return results
	}
}

module.exports = {
	processors: {
		'.jade': pugProcessor,
		'.pug': pugProcessor
	}
}
