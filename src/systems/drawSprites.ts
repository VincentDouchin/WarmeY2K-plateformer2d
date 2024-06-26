import { Position } from "../components/Position";
import { Sprite } from "../components/Sprite";
import { DNASystem, dnaManager } from "warme-y2k";

export class DrawSpritesSystem extends DNASystem{
	constructor(){
		super()
		this.addRequiredComponentTypename('sprite')
	}
	onEntityUpdate(ts: number, eid: number): void {
		const sprite = dnaManager.getComponent(eid,Sprite)
		sprite.sprite.update(ts)
	}
	draw(): void {
		for(const eid of this.eids){
			const sprite = dnaManager.getComponent(eid,Sprite)
			const position = dnaManager.getComponent(eid,Position)
			if(position){
				sprite.sprite.setPosition(position.x,position.y)
			}
			console.log(sprite.sprite.position)
			sprite.sprite.draw()
		}
	}
}