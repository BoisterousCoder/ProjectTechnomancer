'use strict'
function makeMap(name, callback) {
	getBlockTypes(function (blockTypes, itemTypes) {
		readFile(`${resourcesPath}/maps/${name}.map`, function (data) {
			data = data.split('\n')
			let staticLayer = [];
			let entLayer = [];
			let vars = [];
			let hasFPSChanged = false;
			let currentSection = 'begin';
			let yOffset = 0;
			data.forEach(function (row, y) {
				row = row.trim()
				if (row == '***') {
					switch (currentSection) {
					case 'begin':
						currentSection = 'staticLayer'
						yOffset = y + 1;
						break;
					case 'staticLayer':
						currentSection = 'entLayer'
						yOffset = y + 1;
						break;
					case 'entLayer':
						currentSection = 'settings'
						break;
					case 'settings':
						currentSection = 'blockProps'
						break;
					case 'blockProps':
						currentSection = 'inventory'
						break;
					case 'inventory':
						currentSection = 'end'
						if (!hasFPSChanged) {
							hasFPSChanged = false;
						}
						callback(staticLayer, entLayer, vars)
						break;
					}
				} else if (currentSection == 'staticLayer') {
					let layer = 0;
					row = row.split('');
					row.forEach(function (symbol, x) {
						blockTypes.forEach(function (blockType) {
							if (symbol == blockType.symbol) {
								let block = new Block(blockType, layer, x, y - yOffset);
								block.id = staticLayer.length;
								block.layer = 'staticLayer';
								staticLayer[block.id] = block;
							}
						})
					});
				} else if (currentSection == 'entLayer') {
					let layer = 1;
					row = row.split('');
					row.forEach(function (symbol, x) {
						blockTypes.forEach(function (blockType) {
							if (symbol == blockType.symbol) {
								let block = new Block(blockType, layer, x, y - yOffset);
								block.id = entLayer.length;
								block.layer = 'entLayer';
								entLayer[block.id] = block;
							}
						})
					});
				} else if (currentSection == 'settings') {
					row = row.split('=')

					if (row[0].trim() == 'fps') {
						fps = Number(row[1]);
						hasFPSChanged = true;
					} else {
						vars[vars.length] = {
							value: Number(row[1]),
							property: row[0].trim()
						}
					}
				} else if (currentSection == 'blockProps') {
					let value = row.split('=')[1].trim()
					let property = row.split('=')[0].split(':')[1].trim()
					let coords = row.split('=')[0].split(':')[0].split(',')
					let blockX = Number(coords[0])
					let blockY = Number(coords[1])
					let layer = Number(coords[2])
					let hasFoundMatch = false;
					entLayer.forEach(function (block) {
						if (block.x == blockX && block.y == blockY) {
							block[property] = value;
							hasFoundMatch = true
						}
					})
					if (!hasFoundMatch) {
						error(`no block found at ${blockX}, ${blockY} as stated on row ${y}`)
					}
				} else if (currentSection == 'inventory') {
					let items = row.split(':')[1].split(',')
					items.forEach(function (item, i) {
						item = item.trim()
						itemTypes.forEach(function (itemType) {
							if (item == itemType.symbol) {
								items[i] = itemType;
							}
						});
					});
					let coords = row.split(':')[0].split(',')
					let blockX = Number(coords[0])
					let blockY = Number(coords[1])
					let layer = Number(coords[2])
					let hasFoundMatch = false;
					entLayer.forEach(function (block) {
						if (block.x == blockX && block.y == blockY && block.maxVolume) {
							block.inventory = new Inventory(block, items);
							hasFoundMatch = true;
						}
					})
					if (!hasFoundMatch) {
						error(`no block found at ${blockX}, ${blockY} as stated on row ${y}`);
					}
				}
			});
		});
	});
}