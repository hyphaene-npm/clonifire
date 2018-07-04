#!/usr/bin/env node

const fs = require('fs');
const execa = require('execa');
const homedir = require('os').homedir();

const { GITLAB_SSH_START, GITLAB_HTTPS_START, GIT_EXT, EMPTY } = require('./constants');

const cloneToDirectory = async () => {
	const args = process.argv.slice(2);
	if (args.length !== 1) {
		console.log('One and only one arg must be provided');
		process.exit(1);
	}
	const [arg] = args;

	const startsWithHTTPS = arg.startsWith(GITLAB_HTTPS_START);
	if (!(arg.startsWith(GITLAB_SSH_START) || startsWithHTTPS) && !arg.endsWith(GIT_EXT)) {
		console.log('Does not seem to be a gitlab link');
		process.exit(1);
	}
	if (startsWithHTTPS) {
		console.log('Please use SSH');
		process.exit(1);
	}

	const folders = arg
		.replace(GITLAB_SSH_START, EMPTY)
		.replace(GIT_EXT, EMPTY)
		.split('/');

	const lastFolder = [folders.pop()];

	process.chdir(homedir);

	folders.forEach(folder => {
		if (!fs.existsSync(folder)) {
			fs.mkdirSync(folder);
		}
		process.chdir(folder);
	});
	const pathToClone = homedir + '/' + folders.join('/') + '/' + lastFolder;
	if (fs.existsSync(pathToClone)) {
		console.log('folder already exists');
		process.exit(1);
	} else {
		try {
			await execa.shell(`git clone ${arg} ${lastFolder}`);
		} catch (e) {
			console.log({ e });
		}
	}
};

cloneToDirectory();
