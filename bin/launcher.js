'use strict'
const keepLauncherOpen = false;
const isDebugMode = true;
const filename = '__main__.jade';
const mainDir = '../versions/';
const modDir = '../mods/';
let zipName = 'version_0-0-4';

const npmi = require('npmi');
const fs = require('fs');
const gui = require('nw.gui');
let win = gui.Window.get();
let baseModules = [{
	name: 'jade',
	version: '1.11.0'
		}, {
	name: 'adm-zip',
	version: '0.4.7'
		}];
let modNames = fs.readdirSync(modDir);
window.onload = function () {
	log('loading base imports');
	npmInstall(baseModules, start, function (fractionOfModulesLoaded) {
		displayProgress(fractionOfModulesLoaded / (modNames.length + 2));
	});
}
function error(msg){
	console.error(msg);
	document.getElementById('console').innerHTML += `<span class='error'>${msg}</span><br/>`
}
function log(msg){
	console.log(msg);
	document.getElementById('console').innerHTML += `<span class='log'>${msg}</span><br/>`
}
function warn(msg){
	console.warn(msg);
	document.getElementById('console').innerHTML += `<span class='warn'>${msg}</span><br/>`
}
function npmInstall(mods, callback, progressCallback) {
	let loadedModules = 0
	for (let mod of mods) {
		npmi(mod, function (err) {
			if (err) {
				error(err);
			} else {
				loadedModules++;
				if (progressCallback) {
					progressCallback(loadedModules / mods.length);
				}
				if (loadedModules >= mods.length) {
					callback();
				}
			}
		});
	}
	if (mods.length == 0) {
		callback();
	}
}

function displayProgress(progress) {
	win.setProgressBar(progress);
	document.getElementById('progressBar').style.width = progress*100 + '%';
	log((progress * 100) +'% of imports loaded');
}

function start() {
	const jade = require('jade');
	const Zip = require('adm-zip');
	let hasReloaded = false;

	function compileSingle(fileName, dir, args, zipName) {
		if (fileName.split('.')[1] == 'jade') {
			fileName = fileName.split('.')[0];
			let data;
			if (isDebugMode) {
				data = readFile(`${dir}${zipName}/${fileName}` + '.jade');
			} else {
				data = readZip(dir, zipName, fileName + '.jade');
			}
			let fileContent = jade.render(data, args);
			fs.writeFile(fileName + '.html', fileContent);
			return fileName + '.html';
		} else {
			error('Not a Jade file');
		}
	}

	function loadImports(dir, zipName, callback, progressCallback) {
		let mods = [];
		try {
			if (isDebugMode) {
				mods = readFile(`${dir}${zipName}/imports.npm`).split('\n');
			} else {
				mods = readZip(dir, zipName, 'imports.npm').split('\n');
			}
		} catch (e) {
			warn(`could not find imports.npm; the file does exist or is formatted improperly for ${zipName} in ${dir}`);
		}

		let mods_ = [];
		for (let mod of mods) {
			mods_.push({
				name: mod.split('@')[0].trim(),
				version: mod.split('@')[1].trim()
			});
		}
		try {
			npmInstall(mods_, callback, progressCallback);
		} catch (e) {
			error(`could not load imports for ${zipName} in ${dir}.`);
			callback();
		}
	}

	function readFile(url) {
		return fs.readFileSync(url, 'utf8');
	}


	function readZip(dir, zipName, fileName) {
		let zip = new Zip(`${dir}${zipName}.code`);
		let zipEntries = zip.getEntries();
		for (let zipEntry of zipEntries) {
			if (zipEntry.name == fileName) {
				return zipEntry.getData().toString();
			}
		}
	}

	function compareZipEntries(a, b) {
		a = Number(a.name.split('_')[0])
		b = Number(b.name.split('_')[0])
		return a - b;
	}

	let win = gui.Window.get();
	win.on('loading', function () {
		if (!hasReloaded) {
			hasReloaded = true;
			win.reloadIgnoringCache();
		}
	});

	//load from code file
	let zipNames = [];
	let mods = [];
	let args = {
		dir: mainDir,
		modDir,
		zipName,
		isDebugMode,
		codeFileName: zipName
	}
	let modsImported = 0;
	log('loaded base imports');
	log('loading mod imports');
	for (let modName of modNames) {
		if (modName.split('.')[1] == 'code') {
			modName = modName.split('.')[0];
			mods.push(modName);
			loadImports(modDir, modName, function () {
				modsImported++;
				if (modsImported >= modNames.length - 1) {
					args.mods = mods;
					log('loaded mod imports');
					log('loaded version imports');
					loadImports(mainDir, zipName, function () {
						//window.location.href = compileSingle(filename, mainDir, args, zipName);
						log('loaded version imports');
						let newWin = gui.Window.open(compileSingle(filename, mainDir, args, zipName), {
							title: win.title,
							menu: win.menu,
							isFullscreen: win.isFullscreen,
							zoomLevel: win.zoomLevel,
							width: win.width,
							height: win.height,
							x: win.x,
							y: win.y,
						});
						newWin.on('loaded', function () {
							newWin.requestAttention(true);
							if (isDebugMode) {
								newWin.showDevTools();
							}
							newWin.reload();
							if (!keepLauncherOpen) {
								win.close();
							}
						});
					}, function (fractionOfModulesLoaded) {
						displayProgress((modsImported + fractionOfModulesLoaded + 2) / (modNames.length + 2))
					});
				}
			}, function (fractionOfModulesLoaded) {
				displayProgress((modsImported + fractionOfModulesLoaded + 1) / (modNames.length + 2))
			});
		}
	}
}