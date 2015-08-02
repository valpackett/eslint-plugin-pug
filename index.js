'use strict'

var lexer = require('jade-lexer')
var parser = require('jade-parser')
var walk = require('jade-walk')

var lines = []
var indents = []

var jadeProcessor = {
	preprocess: function(text, filename) {
		lines = []
		indents = []
		var results = []
		var inScript = false
		var textLines = text.split('\n')
		walk(parser(lexer(text, filename), filename), function before(node, replace) {
			if (node.type === 'Tag' && node.name === 'script'
				&& node.attrs.filter(function(attr) { return attr.val.replace(/['"]/g, '') !== 'text/javascript' }).length <= 0) {
				inScript = true
			}
		}, function after(node, replace) {
			if (inScript) {
				if (node.type !== 'Text') {
					inScript = false
					return
				}
				if (node.val === '\n') return
				results.push(node.val)
				lines.push(node.line)
				indents.push(textLines[node.line - 1].indexOf(node.val.split('\n')[0]))
			}
		}, {includeDependencies: true})
		return results
	},
	postprocess: function(messages, filename) {
		var result = []
		messages.forEach(function(errors, idx) {
			errors.forEach(function(error) {
				error.line += lines[idx] - 1
				error.column += indents[idx]
				result.push(error)
			})
		})
		return result
	}
}

module.exports = {
	processors: {
		'.jade': jadeProcessor
	}
}
