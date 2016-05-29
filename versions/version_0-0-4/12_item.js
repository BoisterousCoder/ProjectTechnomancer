'use strict'
class Inventory {
	constructor(block, itemPropsList) {
		this.id = inventories.length;
		this.items = [];
		this.mass = 0;
		this.volume = 0;
		this.maxVolume = block.maxVolume;
		this.name = block.name;
		if (block.equipSlots) {
			this.slots = {};
			for (let slotName of block.equipSlots) {
				this.slots[slotName] = {
					isEmpty: true
				};
			}
		}
		this._isVisable = false;
		for (let itemProps of itemPropsList) {
			this.push(itemProps);
		}
		inventories[inventories.length] = this;
	}
	makeDisplay() {
		$('#inventoryCont').append(`<div inventoryId='${this.id}' class='inventory'></div>`);
		$('#equipSlots').append(`<div inventoryId='${this.id}' class='inventorySlots'></div>`);
		$('#inventoryNav').append(`<button inventoryId='${this.id}' class='inventoryNav'></button>`);

		this.nav = $(`[inventoryId=${this.id}].inventoryNav`);
		this.display = $(`[inventoryId=${this.id}].inventory, [inventoryId=${this.id}].inventorySlots`);
		this.mainDisplay = $(`[inventoryId=${this.id}].inventory`);
		this.slotsDisplay = $(`[inventoryId=${this.id}].inventorySlots`);

		this.display.addClass('invisible');
		this.nav[0].addEventListener('dragover', this._allowDrop);
		this.nav[0].addEventListener('drop', this._drop);
		this.nav.addClass('invisible');
		this.nav.html(this.name);
		let self = this;
		this.nav.click(function () {
			for (let inventory of inventories) {
				inventory.isVisable = false;
			}
			self.isVisable = true;
		});
		for (let item of this.items) {
			this.mainDisplay.append(item.html);
		}
		this._regenSlotDisplay();
	}
	showNav() {
		if (this.nav) {
			this.nav.removeClass('invisible');
		} else {
			//warn('You cant call interact with inventory classes until you call their makeDisplay property');
		}
	}
	hideNav() {
		if (this.nav) {
			this.nav.addClass('invisible');
		} else {
			//warn('You cant call interact with inventory classes until you call their makeDisplay property');
		}
	}
	update() {
		if (this.display) {
			if (this.isVisable) {
				for (let item of this.items) {
					item.update();
				}
			}
		} else {
			//warn('You cant call interact with inventory classes until you call their makeDisplay property');
		}
	}
	remove(loc, amount) {
		let item = this.items[loc];
		if (!amount) {
			amount = item.amount;
		} else if (item.amount > amount) {
			amount = item.amount;
		}
		item.amount -= amount;
		this.mass -= item.mass * amount;
		this.volume -= item.volume * amount;
		return item;
	}
	equip(loc) {
		let item = this.items[loc];
		if (item.equipType) {
			let equipSlotName;
			for (let testSlotName in this.slots) {
				if (testSlotName == item.equipType) {
					equipSlotName = testSlotName;
				}
			}
			if (equipSlotName) {
				this.slots[equipSlotName] = item;
				this._regenSlotDisplay();
				return item;
			} else {
				return error();
			}
		} else {
			return error();
		}

		function error() {
			let warnString = `cannot equip ${item.name} to ${this.name}`;
			alert(warnString);
			warn(warnString);
			return undefined;
		}
	}
	_regenSlotDisplay() {
		this.slotsDisplay.html('');
		for (let slotName in this.slots) {
			let item = this.slots[slotName];

			if (item.isEmpty) {
				let slot = $('<div></div>');
				slot.attr('inventoryId', this.id);
				slot.attr('slotName', slotName);
				slot.addClass('itemDisplay');
				slot[0].addEventListener('dragover', this._allowDrop);
				slot[0].addEventListener('drop', this._equipDrop);
				this.slotsDisplay.append(slot[0]);
			} else {
				let display = item.htmlEquip;
				display.addEventListener('dragover', this._allowDrop);
				display.addEventListener('drop', this._equipDrop);
				this.slotsDisplay.append(display);
			}
		}
	}
	_allowDrop(ev) {
		ev.preventDefault();
	}
	_drop(ev) {
		ev.preventDefault();
		let itemData = JSON.parse(ev.dataTransfer.getData("text"));
		let targetId = $(ev.target).attr('inventoryId');

		let targetInventory = inventories[targetId];
		let startInventory = inventories[Number(itemData.inventoryId)];

		let item = startInventory.items[Number(itemData.loc)];
		let isSuccess = !isNaN(targetInventory.push(item.initProps, item.amount));
		if (isSuccess) {
			startInventory.remove(Number(item.loc));
		}
	}
	_equipDrop(ev) {
		ev.preventDefault();
		let itemData = ev.dataTransfer.getData("text");
		let inventory = inventories[Number(itemData.inventoryId)];
		inventory.equip(Number(itemData.loc));
	}
	push(itemProps, amount) {
		if (!amount) {
			amount = 1;
		}
		let isAlreadyMade = false
		let item;
		let loc;
		if ((itemProps.volume * amount + this.volume) > this.maxVolume) {
			let warnString = `cant fit ${amount} ${itemProps.name}s in ${this.name}'s inventory!`;
			warn(warnString);
			alert(warnString);
			return undefined;
		} else {
			for (item of this.items) {
				if (item.name == itemProps.name) {
					item.amount += amount;
					loc = item.loc;
					isAlreadyMade = true;
					break;
				}
			}
			let itemStartAmount = 1;
			if (!isAlreadyMade) {
				loc = this.items.length;
				if (itemProps.equipType) {
					item = new Equipable(itemProps, this.id, itemStartAmount, loc);
				} else {
					item = new Item(itemProps, this.id, itemStartAmount, loc);
				}
				item.loc = loc;
				item.amount = amount;
				this.items[loc] = item;
			}
			this.mass += item.mass * amount;
			this.volume += item.volume * amount;
			if (this.mainDisplay) {
				this.mainDisplay.append(item.html);
			}

			return loc;
		}
	}
	get isVisable() {
		return this._isVisable;
	}
	set isVisable(isVisable) {
		if (this.display) {
			this._isVisable = isVisable;
			if (isVisable) {
				this.display.removeClass('invisible');
				$('#mass').html(this.mass);
				$('#inventoryTitle').html(this.name);
				$('#volume').html(`${this.volume}/${this.maxVolume}`);
			} else {
				this.display.addClass('invisible');
				$('#mass').html('');
				$('#inventoryTitle').html('');
				$('#volume').html('');
			}
		} else {
			error('You cant call interact with inventory classes until you call their makeDisplay property');
		}
	}
}
class Item {
	constructor(props, inventoryId, amount, loc) {
		for (let key in props) {
			this[key] = props[key];
		}
		this.initProps = props;
		this.amount = amount;
		this.img = this.animation;
		this.loc = loc;
		this.inventoryId = inventoryId;
		this.display = $('<div></div>');
		this.display.addClass('itemDisplay');
		this.display.attr('inventoryId', this.inventoryId);
		this.display.attr('loc', this.loc);
		this.display.attr('draggable', 'true');
		this.display[0].addEventListener('drag', this._drag);
	}
	_drag(ev) {
		let $target = $(ev.target);
		ev.dataTransfer.setData("application/json", {
			loc: $target.attr('loc'),
			inventoryId: $target.attr('inventoryId')
		});
	}
	update() {
		this._updatedImg = htmlImgs[this._img].getImg();
		this.img.draggable = false;
		this.display.html(this.img);
		this.display.append(this.amountTag);
	}
	get amountTag() {
		let tag = $('<p></p>');
		tag.addClass('itemAmount');
		tag.html(this.amount + ' ' + this.name)
		return tag;
	}
	get img() {
		return this._updatedImg;
	}
	set img(imgName) {
		this._img = createImg(imgName, 'svg');
		this._updatedImg = htmlImgs[this._img].getImg();
	}
	get html() {
		this.display.html(this.img);
		this.display.append(this.amountTag);
		return this.display[0];
	}
}
class Equipable extends Item {
	constructor(props, inventoryId, amount, loc) {
		super.constructor(props, inventoryId, amount, loc);
		this._oldUpdate = super.update;
		this.equipDisplay = $('<div></div>');
		this.equipDisplay.addClass('itemDisplay');
		this.equipDisplay.attr('inventoryId', this.inventoryId);
		this.equipDisplay.attr('slotName', this.equipType);
	}
	update() {
		this.equipDisplay.html(this.img);
		this._oldUpdate();
	}
	get htmlEquip() {
		this.equipDisplay.html(this.img);
		return this.equipDisplay[0];
	}
	get isEmpty() {
		return false;
	}
}