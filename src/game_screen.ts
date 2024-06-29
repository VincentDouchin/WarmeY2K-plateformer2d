import { Gfx2TileMap, Gfx2TileMapLayer, Screen, UT, dnaManager, gfx2Manager } from 'warme-y2k'
// ---------------------------------------------------------------------------------------
import { spawnPlayer } from './entities/spawnPlayer'
import { DrawSpritesSystem } from './systems/drawSprites'
import { MovePlatformSystem } from './systems/movePlatform'
import { MovePlayerSystem } from './systems/movePlayer'
// ---------------------------------------------------------------------------------------
const FPS = 60
const MS_PER_FRAME = 1000 / FPS
class GameScreen extends Screen {
	elapsedTime = 0
	tileMap = new Gfx2TileMap()
	layers: Gfx2TileMapLayer[] = []
	constructor() {
		super()
	}

	async onEnter() {
		await this.tileMap.loadFromSpriteFusion('level1/map.json', 'level1/spritesheet.png')
		dnaManager.setup([
			new DrawSpritesSystem(),
			new MovePlayerSystem(this.tileMap, this.tileMap.getTileLayer(0)),
			new MovePlatformSystem(),
		])
		this.layers = [5, 4, 3, 2].map((index) => {
			const layer = new Gfx2TileMapLayer()
			layer.loadFromTileMap(this.tileMap, index)
			return layer
		})
		await Promise.all([
			spawnPlayer(50, 100),
		])

		gfx2Manager.setCameraScale(5, 5)
		gfx2Manager.ctx.imageSmoothingEnabled = false
	}

	update(ts: number) {
		if (this.elapsedTime > MS_PER_FRAME) {
			dnaManager.update(this.elapsedTime)
			this.elapsedTime = 0
		}
		gfx2Manager.cameraPosition[0] = UT.CLAMP(gfx2Manager.cameraPosition[0], 70, 600)
		this.elapsedTime += ts
	}

	draw() {
		for (const layer of this.layers) {
			layer.draw()
		}
		dnaManager.draw()
	}
}

export { GameScreen }
