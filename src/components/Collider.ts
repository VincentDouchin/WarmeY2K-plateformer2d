import { DNAComponent } from 'warme-y2k'

export class Collider extends DNAComponent {
	constructor(public min: { x: number, y: number }, public max: { x: number, y: number }) {
		super('collider')
	}
}