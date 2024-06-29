import { DNAComponent } from 'warme-y2k'

export class Jump extends DNAComponent {
	jumping = false
	wallJumping = false
	platform: number | null = null
	dropDown: number | null = null
	constructor(
	) {
		super('jump')
	}
}