import type { Gfx2TileLayer, Gfx2TileMap } from 'warme-y2k'
import { DNASystem, dnaManager, gfx2Manager, inputManager } from 'warme-y2k'
import { Velocity } from '../components/Velocity'
import { Sprite } from '../components/Sprite'
import { Position } from '../components/Position'
import { Collider } from '../components/Collider'

export enum PlayerActions {
	Left = 'left',
	Right = 'right',
	Down = 'down',
	Up = 'up',
	Jump = 'jump',
}
export class MovePlayerSystem extends DNASystem {
	constructor(public map: Gfx2TileMap, public collisionLayer: Gfx2TileLayer) {
		super()
		this.addRequiredComponentTypename('position')
		this.addRequiredComponentTypename('playerController')
		this.addRequiredComponentTypename('sprite')
		this.addRequiredComponentTypename('velocity')
		inputManager.registerAction('keyboard', 'KeyA', PlayerActions.Left)
		inputManager.registerAction('keyboard', 'KeyD', PlayerActions.Right)
		inputManager.registerAction('keyboard', 'KeyW', PlayerActions.Up)
		inputManager.registerAction('keyboard', 'KeyS', PlayerActions.Down)
		inputManager.registerAction('keyboard', 'Space', PlayerActions.Jump)
	}

	onEntityUpdate(ts: number, eid: number): void {
		const position = dnaManager.getComponent(eid, Position)
		const { sprite } = dnaManager.getComponent(eid, Sprite)
		const velocity = dnaManager.getComponent(eid, Velocity)
		const collider = dnaManager.getComponent(eid, Collider)
		const force = 0.05
		let inputForce = 0
		if (inputManager.isActiveAction(PlayerActions.Left)) {
			inputForce -= force * ts
			sprite.play('walk', true, true)
		}
		if (inputManager.isActiveAction(PlayerActions.Right)) {
			inputForce += force * ts
			sprite.play('walk', true, true)
		}

		if (inputForce === 0) {
			sprite.play('idle', true, true)
		}
		velocity.x += inputForce
		let newX = position.x + velocity.x
		let newY = position.y + velocity.y
		const middleX = this.map.getLocationCol(newX)
		const bottom = this.map.getLocationRow(newY + collider.min.y + 0.1)
		const top = this.map.getLocationRow(newY - collider.max.y - 0.1)
		// gravity
		velocity.y += (Math.sign(velocity.y) === -1 ? 0.0001 : 0.3) * ts

		velocity.x *= 0.01 * ts
		velocity.y *= 0.01 * ts

		const middleY = this.map.getLocationRow(newY)
		const right = this.map.getLocationCol(newX + collider.max.x + 0.1)
		const left = this.map.getLocationCol(newX - collider.min.x - 0.1)

		if (this.areColliding([middleX, bottom])) {
			newY = bottom * this.map.tileHeight - collider.min.y
			velocity.y = 0
		} else if (this.areColliding([left, bottom], [right, bottom])) {
			newY = bottom * this.map.tileHeight - collider.min.y
			velocity.y = 0
		}
		 if (this.areColliding([middleX, top])) {
			newY = (top + 1) * this.map.tileHeight + collider.max.y
		}
		if (this.areColliding([left, middleY])) {
			newX = (left + 1) * this.map.tileWidth + collider.min.x
			velocity.x = 0
		}
		if (this.areColliding([right, middleY])) {
			newX = right * this.map.tileWidth - collider.max.x
			velocity.x = 0
		}
		position.x = newX
		position.y = newY
		if (inputManager.isActiveAction(PlayerActions.Jump) && this.areColliding([middleX, bottom])) {
			velocity.y -= 0.6 * ts
		}
		gfx2Manager.setCameraPosition(position.x, position.y)
	}

	areColliding(...coords: [number, number][]) {
		return coords.some(([col, row]) => this.collisionLayer.getTile(col, row) === 1)
	}
}