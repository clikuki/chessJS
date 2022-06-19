type Color = 0 | 1; // Black, White
type BoardSide = 0 | 1; // Queenside, Kingside

class Tile {
	elem: HTMLElement;
	color: Color;
	piece: HTMLImageElement | null = null;
	constructor(grid: Board, color: Color) {
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

class CastlingRights extends Array {
	// black queen, black king, white queen, white king
	rights = [false, false, false, false];
	can(color: Color, side: BoardSide) {
		return this.rights[color * 2 + side];
	}
	set(color: Color, side: BoardSide, right: boolean) {
		this.rights[color * 2 + side] = right;
	}
}

export class Board {
	tiles: Tile[];
	elem: HTMLElement;
	activeClr: Color = 1;
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
					.map((_, i) => new Tile(this, ((i + j) % 2) as Color)),
			);
		parent.appendChild(this.elem);
	}
}
