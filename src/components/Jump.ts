import { DNAComponent } from 'warme-y2k'

export class Jump extends DNAComponent {
	gravMultiplier = 1
	jumping = false
	platform: number | null = null
	constructor(
		public jumpHeight: number,
		public timeToJumpApex: number,
		public downwardMovementMultiplier: number,
	) {
		super('jump')
	}
}