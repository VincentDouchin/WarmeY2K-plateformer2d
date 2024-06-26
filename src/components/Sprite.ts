import { DNAComponent, Gfx2SpriteJAS } from "warme-y2k";

export class Sprite extends DNAComponent{
	constructor(public sprite :Gfx2SpriteJAS){
		super('sprite')
	}
}