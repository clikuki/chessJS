import { Board } from './Board';

export class Move {
	startSq: number;
	targetSq: number;
	isEnpassant: boolean;
	constructor(startSq: number, targetSq: number, isEnpassant = false) {
		this.startSq = startSq;
		this.targetSq = targetSq;
		this.isEnpassant = isEnpassant;
	}
}

export class CastlingMove {
	clr: 0 | 1;
	side: 0 | 1;
	constructor(clr: 0 | 1, side: 0 | 1) {
		this.clr = clr;
		this.side = side;
	}
}

export class MoveGenerator {
	board: Board;
	constructor(board: Board) {
		this.board = board;
	}
}
