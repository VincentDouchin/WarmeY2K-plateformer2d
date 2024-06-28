import { DNAComponent } from 'warme-y2k'

export class Platform extends DNAComponent {
	 
	constructor(
		public previousPosition: { x: number, y: number },
		public from: { x: number, y: number },
		public to: { x: number, y: number },
		public direction = true,
	) {
		super('platform')
	}
}