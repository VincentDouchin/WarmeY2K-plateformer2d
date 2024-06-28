import { DNASystem, dnaManager } from 'warme-y2k'
import { Velocity } from '../components/Velocity'
import { Position } from '../components/Position'
import { Sprite } from '../components/Sprite'

export class DrawSpritesSystem extends DNASystem {
	constructor() {
		super()
		this.addRequiredComponentTypename('sprite')
		this.addRequiredComponentTypename('position')
	}

	onEntityUpdate(ts: number, eid: number): void {
		const { sprite } = dnaManager.getComponent(eid, Sprite)
		const position = dnaManager.getComponent(eid, Position)
		try {
			const velocity = dnaManager.getComponent(eid, Velocity)
			if (velocity) {
				if (velocity.x > 0.1 && Math.sign(velocity.x) === 1) {
					sprite.setFlipX(false)
				}
				if (velocity.x < 0.1 && Math.sign(velocity.x) === -1) {
					sprite.setFlipX(true)
				}
			}
		} catch (e) {

		}
		sprite.setPosition(position.x, position.y)
		sprite.update(ts)
	}

	draw(): void {
		for (const eid of this.eids) {
			const sprite = dnaManager.getComponent(eid, Sprite)
			sprite.sprite.draw()
		}
	}
}