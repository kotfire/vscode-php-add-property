import * as path from 'path';

import { runTests } from 'vscode-test';

async function main() {
	try {
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '../../');

		// The path to test runner
		// Passed to --extensionTestsPath
		const extensionTestsPath = path.resolve(__dirname, './suite/index');

		const testUserDir = path.resolve(__dirname, './user');

		const vscodeCompatibilityString = require('../../package.json').engines.vscode;
		const vscodeMinimumVersion = vscodeCompatibilityString.replace(/[^\d\.]/g, '');

		await runTests(
			{
				version: vscodeMinimumVersion,
				extensionDevelopmentPath,
				extensionTestsPath,
				launchArgs: [
					`--user-data-dir=${testUserDir}`,
					'--disable-extensions'
				],
				extensionTestsEnv: {
					'VSCODE_VERSION': vscodeMinimumVersion,
				}
			}
		);

		await runTests(
			{
				extensionDevelopmentPath,
				extensionTestsPath,
				launchArgs: [
					`--user-data-dir=${testUserDir}`,
					'--disable-extensions'
				]
			}
		);
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();
