import { DNAComponent, eventManager, inputManager } from 'warme-y2k'
import { PlayerActions } from '../PlayerActions'

export class Jump extends DNAComponent {
	jumping = false
	wallJumping = false
	platform: number | null = null
	dropDown: number | null = null
	justPressedJump = false
	constructor(
	) {
		super('jump')
		eventManager.subscribe(inputManager, 'E_ACTION_ONCE', {}, (e: { actionId: string }) => {
			if (e.actionId === PlayerActions.Jump) {
				this.justPressedJump = true
			}
		})
	}
}