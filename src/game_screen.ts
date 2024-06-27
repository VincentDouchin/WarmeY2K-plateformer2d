import { Gfx2TileMap, Gfx2TileMapLayer, Screen, dnaManager, gfx2Manager } from 'warme-y2k'
// ---------------------------------------------------------------------------------------
import { DrawSpritesSystem } from './systems/drawSprites'
import { MovePlayerSystem } from './systems/movePlayer'
import { spawnPlayer } from './systems/spawnPlayer'
// ---------------------------------------------------------------------------------------
const FPS = 60
const MS_PER_FRAME = 1000 / FPS
class GameScreen extends Screen {
	elapsedTime = 0

	bgLayer = new Gfx2TileMapLayer()
	collisionLayer = new Gfx2TileMapLayer()
	platformLayer = new Gfx2TileMapLayer()
	constructor() {
		super()
	}

	async onEnter() {
		const tileMap = new Gfx2TileMap()
		await tileMap.loadFromSpriteFusion('level1/map.json', 'level1/spritesheet.png')
		dnaManager.setup([new DrawSpritesSystem(), new MovePlayerSystem(tileMap, tileMap.getTileLayer(0))])
		this.bgLayer.loadFromTileMap(tileMap, 0)
		this.bgLayer.setPositionZ(1)
		this.platformLayer.loadFromTileMap(tileMap, 1)
		this.collisionLayer.loadFromTileMap(tileMap, 2)
		await spawnPlayer()
		gfx2Manager.setCameraScale(5, 5)
	}

	update(ts: number) {
		if (this.elapsedTime > MS_PER_FRAME) {
			dnaManager.update(this.elapsedTime)
			this.elapsedTime = 0
		}
		this.elapsedTime += ts
		this.bgLayer.update(ts)
		this.platformLayer.update(ts)
		this.collisionLayer.update(ts)
	}

	draw() {
		this.bgLayer.draw()
		this.platformLayer.draw()
		dnaManager.draw()
	}
}

export { GameScreen }
