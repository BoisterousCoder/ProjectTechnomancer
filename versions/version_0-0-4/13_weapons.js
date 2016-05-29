'use strict'
class Bullet extends Block{
	constructor(imgSrc, rotation, velocity, damage, layer, pos){
		this._onColide = super.onColide;
		let props = {
			name:'bullet',
			symbol:'B',
			animation:imgSrc
		};
		this.damage = damage;
		this.velocity = velocity;
		this.rotation = rotation;
		super.constructor(props, layer, pos.x, pos.y);
	}
	onColide(game, colidingBlock){
		this._onColide(game);
		if(colidingBlock.heat){
			colidingBlock.heat -= this.damage;
		}
		this.kill();
	}
}