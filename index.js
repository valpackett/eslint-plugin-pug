'use strict'

var lexer = require('jade-lexer')
var parser = require('jade-parser')
var walk = require('jade-walk')

var lines = []
var indents = []

function isValidScript (node) {
	return node.type === 'Tag' && node.name === 'script'
		&& node.attrs.filter(function (attr) { return attr.val.replace(/['"]/g, '') !== 'text/javascript' }).length <= 0
}

var jadeProcessor = {
	preprocess: function (text, filename) {
		lines = []
		indents = []
		var textLines = text.split('\n')
		var results = []
		var inScript = false
		var curNodes = []
		walk(parser(lexer(text, filename), filename), function before (node, replace) {
			if (isValidScript(node)) {
				inScript = true
				curNodes = []
			}
		}, function after (node, replace) {
			if (isValidScript(node)) {
				inScript = false
				if (curNodes.length < 1) return
				results.push(curNodes.map(function (node) { return node.val }).join(''))
				lines.push(curNodes[0].line)
				indents.push(textLines[curNodes[0].line - 1].indexOf(curNodes[0].val.split('\n')[0]))
			}
			if (!inScript) return
			if (node.type !== 'Text') return
			curNodes.push(node)
		}, {includeDependencies: true})
		return results
	},
	postprocess: function (messages, filename) {
		var results = []
		messages.forEach(function (errors, idx) {
			errors.forEach(function (error) {
				error.line += lines[idx] - 1
				error.column += indents[idx]
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
