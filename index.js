'use strict'

var lexer = require('jade-lexer')
var parser = require('jade-parser')
var walkExtract = require('jade-walk-extract-text')

var extractions = []

function isValidScript (node) {
	return node.type === 'Tag' && node.name === 'script'
		&& node.attrs.filter(function (attr) { return attr.val.replace(/['"]/g, '') !== 'text/javascript' }).length <= 0
}

var jadeProcessor = {
	preprocess: function (text, filename) {
		extractions = walkExtract(parser(lexer(text, filename), filename), text, isValidScript)
		return extractions.map(function (x) { return x.text })
	},
	postprocess: function (messages, filename) {
		var results = []
		messages.forEach(function (errors, idx) {
			errors.forEach(function (error) {
				var extraction = extractions[idx]
				error.line += extraction.line - 1
				error.column += extraction.indent
				results.push(error)
			})
		})
		return results
	}
}

module.exports = {
	processors: {
		'.jade': jadeProcessor
	}
}
