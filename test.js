const test = require('tape')
const plugin = require('./')
const CLIEngine = require('eslint').CLIEngine

test('lint js in pug', t => {
	t.plan(1)
	const cli = new CLIEngine({
		envs: ["browser"],
		useEslintrc: false,
		rules: { semi: 2 }
	})
	cli.addPlugin('eslint-plugin-pug', plugin)
	const report = cli.executeOnFiles(['fixture.pug'])
	const errors = report.results[0].messages.map(msg => [msg.line, msg.column, msg.source])
	t.deepEqual(errors, [
		[5,  23, "alert('piped')"],
		[6,  32, "alert('piped-no-space')"],
		[10, 27, "alert('inline')"],
		[14, 9, "})"],
	], 'errors have correct source locations')
})
