import { ImagesContainer, loadImages } from './loadImages.js';
const imgSrcs = loadImages();

export class Piece {
	pieceChar: string;
	color: 0 | 1;
	img: HTMLImageElement;
	constructor(pieceChar: string, color: 0 | 1) {
		this.pieceChar = pieceChar;
		this.color = color;
		const imgSrcKey = `${pieceChar}${
			color ? 'l' : 'd'
		}` as keyof ImagesContainer;
		this.img = document.createElement('img');
		this.img.src = imgSrcs[imgSrcKey];
		this.img.draggable = false;
	}
	remove() {
		this.img.remove();
	}
	setDragging(dragging: boolean) {
		if (dragging) this.img.classList.add('dragging');
		else this.img.classList.remove('dragging');
	}
}

export const pieces = {};
