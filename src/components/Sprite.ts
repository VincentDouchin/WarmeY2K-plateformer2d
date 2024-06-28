import type { Gfx2SpriteJAS, Gfx2SpriteJSS } from 'warme-y2k'
import { DNAComponent } from 'warme-y2k'

export class Sprite<S extends Gfx2SpriteJAS | Gfx2SpriteJSS> extends DNAComponent {
	constructor(public sprite: S) {
		super('sprite')
	}
}