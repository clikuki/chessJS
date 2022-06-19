import { Piece } from './Piece';

export class Tile {
	elem: HTMLElement;
	color: 0 | 1;
	piece: Piece | null = null;
	constructor(grid: Board, color: 0 | 1) {
		this.elem = document.createElement('div');
		this.elem.classList.add('tile', color ? 'light' : 'dark');
		grid.elem.appendChild(this.elem);
		this.color = color;
	}
	remove() {
		if (!this.piece) return;
		this.piece.remove();
		this.piece = null;
	}
	add(piece: Piece) {
		if (this.piece) return;
		this.piece = piece;
		this.elem.appendChild(this.piece.img);
	}
}

export class CastlingRights extends Array {
	// black queen, black king, white queen, white king
	rights = [false, false, false, false];
	can(color: 0 | 1, side: 0 | 1) {
		return this.rights[color * 2 + side];
	}
	set(color: 0 | 1, side: 0 | 1, right: boolean) {
		this.rights[color * 2 + side] = right;
	}
}

export class Board {
	tiles: Tile[];
	elem: HTMLElement;
	activeClr: 0 | 1 = 1;
	castlingRights: CastlingRights = new CastlingRights();
	enpassantSq: number | null = null;
	halfMoves: number = 0;
	fullMoves: number = 1;
	constructor(parent = document.body) {
		this.elem = document.createElement('div');
		this.elem.classList.add('grid');
		this.tiles = new Array(8)
			.fill(0)
			.flatMap((_, j) =>
				new Array(8)
					.fill(0)
					.map((_, i) => new Tile(this, ((i + j) % 2) as 0 | 1)),
			);
		parent.appendChild(this.elem);
	}
}
