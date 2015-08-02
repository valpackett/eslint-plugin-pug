var test = require('tape')
var plugin = require('./')
var CLIEngine = require('eslint').CLIEngine

test('lint js in jade', function(t) {
	t.plan(1)
	var cli = new CLIEngine({
		envs: ["browser"],
		useEslintrc: false,
		rules: { semi: 2 }
	})
	cli.addPlugin('eslint-plugin-jade', plugin)
	var report = cli.executeOnFiles(['fixture.jade'])
	var errors = report.results[0].messages.map(function(msg) { return [msg.line, msg.column, msg.source] })
	t.deepEqual(errors, [
		[5,  23, "alert('piped')"],
		[6,  31, "alert('piped-no-space')"],
		[10, 27, "alert('inline')"],
		[12, 22, "alert('dotted')"],
	], 'errors have correct source locations')
})
