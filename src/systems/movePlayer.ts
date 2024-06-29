import type { Gfx2SpriteJAS, Gfx2TileLayer, Gfx2TileMap } from 'warme-y2k'
import { DNASystem, UT, dnaManager, gfx2Manager, inputManager } from 'warme-y2k'
import { PlayerActions } from '../PlayerActions'
import { Collider } from '../components/Collider'
import { Jump } from '../components/Jump'
import { Platform } from '../components/Platform'
import { Position } from '../components/Position'
import { Sprite } from '../components/Sprite'
import { Velocity } from '../components/Velocity'

interface Collision {
	left: number | null
	right: number | null
	top: number | null
	bottom: number | null
	isGrounded: boolean
	isAgainstWall: null | 'right' | 'left'
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

		velocity.x = UT.CLAMP(velocity.x + inputForce, -1, 1)
		const bounds = collider.getBounds(position)

		// Apply more gravity when falling after a jump
		const gravMultiplier = jump.jumping && inputManager.isActiveAction(PlayerActions.Jump) ? 1 : 3
		// Reduce lateral friction when wall jumping
		velocity.x *= 0.03 * ts
		// Reduce vertical velocity when jumping
		velocity.y = UT.LERP(velocity.y, 5 * gravMultiplier, ts / 1000)
		const collisions = this.collideWithTiles(position, velocity, collider)
		// let isGrounded = velocity.y >= 0 && this.areColliding([middleX, bottom])
		if (velocity.y >= 0) {
			const platform = this.collideWithPlatform(position, bounds)
			if (platform !== null) {
				if (inputManager.isActiveAction(PlayerActions.Down)) {
					jump.dropDown = platform[0]
				}
				if (platform[0] !== jump.dropDown) {
					position.y = platform[1] - collider.min.y
					jump.platform = platform[0]
					velocity.y = 0
					collisions.isGrounded = true
					jump.jumping = false
				}
			}
		}
		// Apply platform movement to the player
		if (jump.platform !== null) {
			const platformPosition = dnaManager.getComponent(jump.platform, Position)
			const platform = dnaManager.getComponent(jump.platform, Platform)
			position.x += platformPosition.x - platform.previousPosition.x
			position.y += platformPosition.y - platform.previousPosition.y
		}

		if (collisions.isGrounded) {
			velocity.y = 0
			jump.jumping = false
			jump.dropDown = null
			jump.wallJumping = false
		} else {
			jump.platform = null
		}

		if (jump.justPressedJump && collisions.isGrounded) {
			velocity.y -= 3
			sprite.play('jump', false)
			jump.jumping = true
			collisions.bottom = null
		}
		if (jump.justPressedJump && collisions.isAgainstWall && jump.jumping && !collisions.isGrounded) {
			sprite.play('jump', false)
			jump.wallJumping = true
			velocity.y -= 4
			velocity.x += (collisions.isAgainstWall === 'right' ? -1 : 1) * 20
			collisions[collisions.isAgainstWall] = null
		}
		position.x += velocity.x
		position.y += velocity.y
		this.applyCollisions(collisions, position, collider, velocity)
		gfx2Manager.setCameraPosition(position.x, 70)
		jump.justPressedJump = false
	}

	areColliding(...coords: [number, number][]) {
		return coords.some(([col, row]) => this.collisionLayer.getTile(col, row) !== undefined)
	}

	applyCollisions(collisions: Collision, position: Position, collider: Collider, velocity: Velocity) {
		if (collisions.left) {
			position.x = collisions.left + collider.min.x
			velocity.x = 0
		}
		if (collisions.right) {
			position.x = collisions.right - collider.min.x
			velocity.x = 0
		}
		if (collisions.bottom) {
			position.y = collisions.bottom - collider.min.y
			velocity.y = 0
		}
		if (collisions.top) {
			position.y = collisions.top + collider.max.y
			velocity.y = 0
		}
	}

	collideWithTiles(position: Position, velocity: { x: number, y: number }, collider: Collider) {
		const bounds = collider.getBounds(position)
		const bottom = this.map.getLocationRow(bounds.bottom)
		const top = this.map.getLocationRow(bounds.top)

		const right = this.map.getLocationCol(bounds.right)
		const left = this.map.getLocationCol(bounds.left)
		const collisions: Collision = {
			left: null,
			right: null,
			top: null,
			bottom: null,
			isGrounded: false,
			isAgainstWall: null,
		}
		for (let col = left; col <= right; col++) {
			for (let row = top; row <= bottom; row++) {
				if (this.collisionLayer.getTile(col, row) !== undefined) {
					const tileTop = (row + 1) * this.map.tileHeight
					const tileBottom = row * this.map.tileHeight
					const tileLeft = col * this.map.tileWidth
					const tileRight = (col + 1) * this.map.tileWidth
					const emptyTop = this.collisionLayer.getTile(col, row + 1) === undefined
					const emptyBottom = this.collisionLayer.getTile(col, row - 1) === undefined
					const emptyLeft = this.collisionLayer.getTile(col - 1, row) === undefined
					const emptyRight = this.collisionLayer.getTile(col + 1, row) === undefined

					const bounds = collider.getBounds(position)

					if (emptyBottom && tileTop > bounds.bottom && velocity.y >= 0) {
						collisions.bottom = tileBottom
						collisions.isGrounded = true
					} else if (emptyTop && tileBottom < bounds.top && velocity.y <= 0) {
						collisions.top = tileTop
					} else if (emptyLeft && tileLeft <= bounds.right) {
						collisions.right = tileLeft
						collisions.isAgainstWall = 'right'
					} else if (emptyRight && tileRight >= bounds.left) {
						collisions.isAgainstWall = 'left'
						collisions.left = tileRight
					}
				}
			}
		}
		return collisions
	}

	collideWithPlatform(position: Position, bounds: ReturnType<Collider['getBounds']>) {
		const platforms = dnaManager.getAllComponents(Platform) as Map<number, Platform>
		for (const [eid, _platform] of platforms.entries()) {
			const platformPosition = dnaManager.getComponent(eid, Position)
			const platformCollider = dnaManager.getComponent(eid, Collider)
			const platformBounds = platformCollider.getBounds(platformPosition)
			const isAbove = position.y < platformBounds.top
			const isWithinX = [bounds.left, bounds.right].some(b => platformBounds.left < b && b < platformBounds.right)
			const isWithinY = platformBounds.top < bounds.bottom && bounds.bottom < platformBounds.bottom
			if (isAbove && isWithinX && isWithinY) {
				return [eid, platformBounds.top]
			}
		}
		return null
	}
}