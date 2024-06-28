import { DNASystem, dnaManager } from 'warme-y2k'
import { Platform } from '../components/Platform'
import { Position } from '../components/Position'

export class MovePlatformSystem extends DNASystem {
	constructor() {
		super()
		this.addRequiredComponentTypename('platform')
		this.addRequiredComponentTypename('position')
	}

	onEntityUpdate(ts: number, eid: number): void {
		const position = dnaManager.getComponent(eid, Position)
		const platform = dnaManager.getComponent(eid, Platform)
		const dest = platform.direction ? platform.from : platform.to
		const deltaX = dest.x - position.x
		const deltaY = dest.y - position.y
		const dist = Math.sqrt(deltaX * deltaX + deltaY + deltaY)
		platform.previousPosition = { ...position }
		if (dist <= 0.2) {
			platform.direction = !platform.direction
		} else {
			position.x += Math.sign(deltaX) * 0.01 * ts
			position.y += Math.sign(deltaY) * 0.01 * ts
		}
	}
}