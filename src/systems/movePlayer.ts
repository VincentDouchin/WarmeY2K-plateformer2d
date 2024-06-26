import { Sprite } from "../components/Sprite";
import { Position } from "../components/Position";
import { DNASystem, dnaManager, inputManager } from "warme-y2k";
export enum PlayerActions{
	Left='left',
	Right='right'
}
export class MovePlayerSystem extends DNASystem{
	constructor(){
		super()
		this.addRequiredComponentTypename('position')
		this.addRequiredComponentTypename('playerController')
		this.addRequiredComponentTypename('sprite')
		inputManager.registerAction('keyboard', 'KeyA', PlayerActions.Left)
		inputManager.registerAction('keyboard', 'KeyD', PlayerActions.Right)
	}

	onEntityUpdate(ts: number, eid: number): void {
		const position = dnaManager.getComponent(eid,Position)
		const sprite = dnaManager.getComponent(eid,Sprite)
		if(inputManager.isActiveAction(PlayerActions.Left)){
			position.x -= 1
			sprite.sprite.play('walk',true)
		}
		if(inputManager.isActiveAction(PlayerActions.Right)){
			position.x += 1
		}
	}
}