import { Gfx2SpriteJAS, dnaManager, gfx2TextureManager } from "warme-y2k"
import { PlayerController } from "../components/PlayerController"
import { Position } from "../components/Position"
import { Sprite } from "../components/Sprite"

export const spawnPlayer = async ()=>{
	const animatedSprite = new Gfx2SpriteJAS()
	await animatedSprite.loadFromFile('player/playerAnimations.json')
	animatedSprite.setTexture(await gfx2TextureManager.loadTexture('player/Player.png'))
	animatedSprite.setScale(100,100)
	dnaManager.createEntityWith([
		new Position(0,0),
		new Sprite(animatedSprite),
		new PlayerController()
	])

}