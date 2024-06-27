import { Gfx2SpriteJAS, dnaManager, gfx2TextureManager } from 'warme-y2k'
import { Collider } from '../components/Collider'
import { Velocity } from '../components/Velocity'
import { PlayerController } from '../components/PlayerController'
import { Position } from '../components/Position'
import { Sprite } from '../components/Sprite'

export const spawnPlayer = async () => {
	const animatedSprite = new Gfx2SpriteJAS()
	await animatedSprite.loadFromFile('player/playerAnimations.jas')
	animatedSprite.setTexture(await gfx2TextureManager.loadTexture('player/Player.png'))
	animatedSprite.setOffset(4, 4)
	dnaManager.createEntityWith([
		new Position(40, 0),
		new Sprite(animatedSprite),
		new PlayerController(),
		new Velocity(),
		new Collider({ x: 2, y: 4 }, { x: 2, y: 4 }),
	])
}