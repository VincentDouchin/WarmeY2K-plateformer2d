import Alpine from 'alpinejs'
// ---------------------------------------------------------------------------------------
import { coreManager, gfx2Manager, gfx3DebugRenderer, gfx3FlareRenderer, gfx3Manager, gfx3MeshRenderer, gfx3MeshShadowRenderer, gfx3ParticlesRenderer, gfx3PostRenderer, gfx3ShadowVolumeRenderer, gfx3SkyboxRenderer, gfx3SpriteRenderer, screenManager, uiManager } from 'warme-y2k'
// ---------------------------------------------------------------------------------------
import { GameScreen } from './game_screen'
// ---------------------------------------------------------------------------------------

class GameManager {
	then: number

	constructor() {
		this.then = 0
		Alpine.start()
	}

	async startup() {
		coreManager.enableScanlines(true)
		gfx3DebugRenderer.setShowDebug(true)
		this.run(0)
	}

	run(timeStamp: number) {
		const ts = timeStamp - this.then
		this.then = timeStamp

		// update phase
		gfx2Manager.update(ts)
		uiManager.update(ts)
		screenManager.update(ts)

		// draw phase
		gfx3Manager.beginDrawing()
		gfx2Manager.beginDrawing()
		screenManager.draw()
		gfx2Manager.endDrawing()
		gfx3Manager.endDrawing()

		// render phase
		gfx3Manager.beginRender()
		gfx3MeshShadowRenderer.render()
		gfx3ShadowVolumeRenderer.render()
		gfx3Manager.setDestinationTexture(gfx3PostRenderer.getSourceTexture())
		gfx3Manager.beginPassRender(0)
		gfx3SkyboxRenderer.render()
		gfx3DebugRenderer.render()
		gfx3MeshRenderer.render(ts)
		gfx3SpriteRenderer.render()
		gfx3ParticlesRenderer.render()
		gfx3FlareRenderer.render()
		gfx3Manager.endPassRender()
		gfx3PostRenderer.render(ts, gfx3Manager.getCurrentRenderingTexture())
		gfx3Manager.endRender()

		document.getElementById('fps')!.textContent = (1000 / ts).toFixed(2)
		document.getElementById('rt')!.textContent = (1000 / gfx3Manager.getLastRenderTime()).toFixed(2)

		requestAnimationFrame(timeStamp => this.run(timeStamp))
	}
}

export const gameManager = new GameManager()
gameManager.startup()
screenManager.requestSetScreen(new GameScreen())
