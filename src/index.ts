import { loadImages } from './loadImages.js';
const images = loadImages();
class Tile {
	elem: HTMLElement;
	isLight: boolean;
	piece: HTMLImageElement | null = null;
	constructor(grid: Board, isLight: boolean) {
		this.elem = document.createElement('div');
		this.elem.classList.add('tile', isLight ? 'light' : 'dark');
		grid.elem.appendChild(this.elem);
		this.isLight = isLight;
	}
	remove() {
		if (!this.piece) return;
		this.piece.remove();
		this.piece = null;
	}
	add(imgSrc: string) {
		if (this.piece) return;
		this.piece = document.createElement('img');
		this.piece.src = imgSrc;
		this.elem.appendChild(this.piece);
	}
	hasPiece() {
		return Boolean(this.piece);
	}
}
class Board {
	tiles: Tile[];
	elem: HTMLElement;
	constructor(parent = document.body, fen?: string) {
		this.elem = document.createElement('div');
		this.elem.classList.add('grid');
		this.tiles = new Array(8)
			.fill(0)
			.flatMap((_, j) =>
				new Array(8)
					.fill(0)
					.map((_, i) => new Tile(this, Boolean((i + j) % 2))),
			);
		parent.appendChild(this.elem);
		if (fen) {
			// Read fen
		}
	}
}

const board = new Board();
board.tiles[0].add(images.rd);
board.tiles[1].add(images.nd);
board.tiles[2].add(images.bd);
board.tiles[3].add(images.qd);
board.tiles[4].add(images.kd);
board.tiles[5].add(images.bd);
board.tiles[6].add(images.nd);
board.tiles[7].add(images.rd);
board.tiles[8].add(images.pd);
board.tiles[9].add(images.pd);
board.tiles[10].add(images.pd);
board.tiles[11].add(images.pd);
board.tiles[12].add(images.pd);
board.tiles[13].add(images.pd);
board.tiles[14].add(images.pd);
board.tiles[15].add(images.pd);
board.tiles[48].add(images.pl);
board.tiles[49].add(images.pl);
board.tiles[50].add(images.pl);
board.tiles[51].add(images.pl);
board.tiles[52].add(images.pl);
board.tiles[53].add(images.pl);
board.tiles[54].add(images.pl);
board.tiles[55].add(images.pl);
board.tiles[56].add(images.rl);
board.tiles[57].add(images.nl);
board.tiles[58].add(images.bl);
board.tiles[59].add(images.ql);
board.tiles[60].add(images.kl);
board.tiles[61].add(images.bl);
board.tiles[62].add(images.nl);
board.tiles[63].add(images.rl);
