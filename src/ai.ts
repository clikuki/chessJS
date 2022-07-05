import { Board } from './Board.js';
import { evaluate } from './evaluate.js';
import { Move } from './MoveGenerator.js';

function negaMax(board: Board, depth: number) {
	if (depth <= 0) return evaluate(board);
	let max = -Infinity;
	for (const move of board.generateMoves()) {
		board.makeMove(move);
		const score = -negaMax(board, depth - 1);
		board.unmakeMove();
		if (score > max) max = score;
	}
	return max;
}

export async function ai(board: Board) {
	let max = -Infinity;
	let bestMove: Move | null = null;
	for (const move of board.generateMoves()) {
		board.makeMove(move);
		const score = -negaMax(board, 2 - 1);
		board.unmakeMove();
		if (score > max) {
			max = score;
			bestMove = move;
		}
	}
	return bestMove;
}
