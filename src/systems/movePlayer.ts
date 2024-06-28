import type { Gfx2SpriteJAS, Gfx2TileLayer, Gfx2TileMap } from 'warme-y2k'
import { DNASystem, dnaManager, gfx2Manager, inputManager } from 'warme-y2k'
import { Platform } from '../components/Platform'
import { Velocity } from '../components/Velocity'
import { Sprite } from '../components/Sprite'
import { Position } from '../components/Position'
import { Collider } from '../components/Collider'
import { Jump } from '../components/Jump'

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
		const { sprite } = dnaManager.getComponent<Sprite<Gfx2SpriteJAS>>(eid, Sprite)
		const velocity = dnaManager.getComponent(eid, Velocity)
		const collider = dnaManager.getComponent(eid, Collider)
		const jump = dnaManager.getComponent(eid, Jump)
		const force = 0.1
		let inputForce = 0
		if (inputManager.isActiveAction(PlayerActions.Left)) {
			inputForce -= force * ts
			if (!jump.jumping) sprite.play('walk', true, true)
		}
		if (inputManager.isActiveAction(PlayerActions.Right)) {
			inputForce += force * ts
			if (!jump.jumping) sprite.play('walk', true, true)
		}

		if (inputForce === 0 && !jump.jumping) {
			sprite.play('idle', true, true)
		}
		if (velocity.y === 0) jump.gravMultiplier = 1
		if (velocity.y < -0.01) jump.gravMultiplier = jump.downwardMovementMultiplier

		velocity.x += inputForce
		const bounds = collider.getBounds(position)

		const middleX = this.map.getLocationCol(position.x)
		const bottom = this.map.getLocationRow(bounds.bottom - 0.1)
		const top = this.map.getLocationRow(bounds.top)

		const middleY = this.map.getLocationRow(position.y)
		const right = this.map.getLocationCol(bounds.right)
		const left = this.map.getLocationCol(bounds.left)
		// gravity
		const gravity = (-2 * jump.jumpHeight) * (jump.timeToJumpApex * jump.timeToJumpApex)
		const gravMultiplier = jump.jumping && inputManager.isActiveAction(PlayerActions.Jump) ? 1 : jump.downwardMovementMultiplier
		velocity.x *= 0.01 * ts
		velocity.y -= (gravity / 9.81) * gravMultiplier * 0.03
		let isGrounded = velocity.y >= 0 && this.areColliding([middleX, bottom])
		if (velocity.y >= 0) {
			const platform = this.collideWithPlatform(position, collider, bounds)
			if (platform !== null) {
				jump.platform = platform
				velocity.y = 0
				isGrounded = true
				jump.jumping = false
			}
		}
		if (jump.platform !== null) {
			const platformPosition = dnaManager.getComponent(jump.platform, Position)
			const platform = dnaManager.getComponent(jump.platform, Platform)
			position.x += platformPosition.x - platform.previousPosition.x
			position.y += platformPosition.y - platform.previousPosition.y
		}

		if (isGrounded) {
			velocity.y = 0
			jump.jumping = false
		} else {
			jump.platform = null
		}

		if (inputManager.isActiveAction(PlayerActions.Jump) && isGrounded) {
			const jumpSpeed = Math.sqrt(2 * 9.81 * jump.jumpHeight)
			velocity.y -= jumpSpeed * 0.1
			sprite.play('jump', false)
			jump.jumping = true
		}
		position.x += velocity.x
		position.y += velocity.y

		// this.collideWithTile(middleX, bottom, position, velocity, collider)
		// this.collideWithTile(middleX, top, position, velocity, collider)
		// this.collideWithTile(left, middleY, position, velocity, collider)
		// this.collideWithTile(right, middleY, position, velocity, collider)

		this.collideWithTile(left, bottom, position, velocity, collider)
		this.collideWithTile(right, bottom, position, velocity, collider)

		this.collideWithTile(left, top, position, velocity, collider)
		this.collideWithTile(right, top, position, velocity, collider)

		gfx2Manager.setCameraPosition(position.x, 30)
	}

	areColliding(...coords: [number, number][]) {
		return coords.some(([col, row]) => this.collisionLayer.getTile(col, row) === 1)
	}

	collideWithTile(col: number, row: number, position: { x: number, y: number }, velocity: { x: number, y: number }, collider: Collider) {
		if (this.collisionLayer.getTile(col, row) === 1) {
			const tileTop = (row + 1) * this.map.tileHeight
			const tileBottom = row * this.map.tileHeight
			const tileLeft = col * this.map.tileWidth
			const tileRight = (col + 1) * this.map.tileWidth
			const top = this.collisionLayer.getTile(col, row + 1) !== 1
			const bottom = this.collisionLayer.getTile(col, row - 1) !== 1
			const left = this.collisionLayer.getTile(col - 1, row) !== 1
			const right = this.collisionLayer.getTile(col + 1, row) !== 1
			if (bottom && tileTop > position.y + collider.min.y && velocity.y >= 0) {
				position.y = tileBottom - collider.min.y
			} else if (top && tileBottom < position.y - collider.max.y && velocity.y <= 0) {
				position.y = tileTop + collider.max.y
			} else if (right && tileLeft < position.x - collider.min.x && velocity.x <= 0) {
				position.x = tileRight + collider.min.x
			} else if (left && tileRight > position.x + collider.max.x && velocity.x >= 0) {
				position.x = tileLeft - collider.max.x
			}
		}
	}

	collideWithPlatform(position: Position, collider: Collider, bounds: ReturnType<Collider['getBounds']>) {
		const platforms = dnaManager.getAllComponents(Platform) as Map<number, Platform>
		for (const [eid, _platform] of platforms.entries()) {
			const platformPosition = dnaManager.getComponent(eid, Position)
			const platformCollider = dnaManager.getComponent(eid, Collider)
			const platformBounds = platformCollider.getBounds(platformPosition)
			const isAbove = position.y < platformBounds.top
			const isWithinX = [bounds.left, bounds.right].some(b => platformBounds.left < b && b < platformBounds.right)
			const isWithinY = platformBounds.top < bounds.bottom && bounds.bottom < platformBounds.bottom
			if (isAbove && isWithinX && isWithinY) {
				position.y = platformBounds.top - collider.max.y
				return eid
			}
		}
		return null
	}
}