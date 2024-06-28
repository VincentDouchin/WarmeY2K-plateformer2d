import { Gfx2SpriteJSS, dnaManager, gfx2TextureManager } from 'warme-y2k'
import { Collider } from '../components/Collider'
import { Platform } from '../components/Platform'
import { Position } from '../components/Position'
import { Sprite } from '../components/Sprite'
import { Velocity } from '../components/Velocity'

export const spawnPlatform = async (x: number, y: number) => {
	const sprite = new Gfx2SpriteJSS()
	sprite.setTexture(await gfx2TextureManager.loadTexture('platform.png'))
	sprite.setOffsetNormalized(0.5, 0.5)
	const halfSize = { x: sprite.getTextureRectWidth() / 2, y: sprite.getTextureRectHeight() / 2 }
	dnaManager.createEntityWith([
		new Sprite(sprite),
		new Platform({ x, y }, { x: x + 20, y }, { x: x - 20, y }),
		new Position(x, y),
		new Velocity(),
		new Collider(halfSize, halfSize),
	])
}