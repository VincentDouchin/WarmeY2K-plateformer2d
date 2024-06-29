import { Gfx2SpriteJAS, dnaManager, gfx2TextureManager } from 'warme-y2k'
import { Jump } from '../components/Jump'
import { Collider } from '../components/Collider'
import { Velocity } from '../components/Velocity'
import { PlayerController } from '../components/PlayerController'
import { Position } from '../components/Position'
import { Sprite } from '../components/Sprite'

export const spawnPlayer = async (x: number, y: number) => {
	const animatedSprite = new Gfx2SpriteJAS()
	await animatedSprite.loadFromFile('player/playerAnimations.jas')
	animatedSprite.setTexture(await gfx2TextureManager.loadTexture('player/Player.png'))
	animatedSprite.setOffset(4, 4)
	dnaManager.createEntityWith([
		new Position(x, y),
		new Sprite(animatedSprite),
		new PlayerController(),
		new Velocity(),
		new Collider({ x: 2, y: 4 }, { x: 2, y: 4 }),
		new Jump(),
	])
}