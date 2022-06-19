import { Board } from './Board';

export class Move {
	startSq: number;
	targetSq: number;
	isSilent: boolean;
	constructor(startSq: number, targetSq: number, isSilent: boolean) {
		this.startSq = startSq;
		this.targetSq = targetSq;
		this.isSilent = isSilent;
	}
}

export class MoveGenerator {
	board: Board;
	constructor(board: Board) {
		this.board = board;
	}
}
