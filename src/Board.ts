import BB from './Bitboard.js';
import { Move } from './MoveGeneration.js';
import { Piece } from './Piece.js';

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
	pop() {
		if (!this.piece) return;
		const piece = this.piece;
		this.piece.remove();
		this.piece = null;
		return piece;
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
	blackKingBB: BB = new BB();
	blackQueenBB: BB = new BB();
	blackRookBB: BB = new BB();
	blackBishopBB: BB = new BB();
	blackKnightBB: BB = new BB();
	blackPawnBB: BB = new BB();
	whiteKingBB: BB = new BB();
	whiteQueenBB: BB = new BB();
	whiteRookBB: BB = new BB();
	whiteBishopBB: BB = new BB();
	whiteKnightBB: BB = new BB();
	whitePawnBB: BB = new BB();
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
	makeMove(move: Move) {
		const startTile = this.tiles[move.startSq];
		const targetTile = this.tiles[move.targetSq];
		targetTile.pop();
		targetTile.add(startTile.pop()!);
	}
}
