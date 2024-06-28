import { DNAComponent } from 'warme-y2k'
import type { Position } from './Position'

export class Collider extends DNAComponent {
	constructor(public min: { x: number, y: number }, public max: { x: number, y: number }) {
		super('collider')
	}

	getBounds(position: Position) {
		return {
			left: position.x - this.min.x,
			right: position.x + this.max.x,
			bottom: position.y + this.min.y,
			top: position.y - this.max.y,
		}
	}
}