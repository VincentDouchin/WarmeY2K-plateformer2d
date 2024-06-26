import { Screen, dnaManager } from 'warme-y2k';
// ---------------------------------------------------------------------------------------
import { DrawSpritesSystem } from './systems/drawSprites';
import { MovePlayerSystem } from './systems/movePlayer';
import { spawnPlayer } from './systems/spawnPlayer';
// ---------------------------------------------------------------------------------------
const FPS = 60;
const MS_PER_FRAME = 1000 / FPS;
class GameScreen extends Screen {
  elapsedTime = 0
  constructor() {
    super();
  }
  
  async onEnter() {
    dnaManager.setup([new DrawSpritesSystem(),new MovePlayerSystem()])
    await spawnPlayer()
  }

  update(ts:number) {
    if (this.elapsedTime > MS_PER_FRAME) {
      dnaManager.update(this.elapsedTime);
      this.elapsedTime = 0;
    }
    this.elapsedTime += ts;
  }

  draw() {
    dnaManager.draw();
  }
}

export { GameScreen };
