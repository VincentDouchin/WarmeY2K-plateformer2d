import { DNAComponent } from "warme-y2k";

export class Position extends DNAComponent{
	constructor(public x:number, public y:number){
		super('position')
	}
}
