import { Board } from './Board.js';
import { sqToAlgebraic } from './utility.js';

function pBase(board: Board, depth: number) {
	const moves = board.generateMoves();
	if (depth === 1) return moves.length;
	if (depth <= 0) return 1;
	let nodes = 0;
	for (const move of moves) {
		board.makeMove(move);
		nodes += pBase(board, depth - 1);
		board.unmakeMove();
	}
	return nodes;
}

export function perft(board: Board, depth: number) {
	console.log(`Searching to depth of ${depth}`);
	const moves = board.generateMoves();
	let totalNodes = 0;
	if (depth === 1) totalNodes = moves.length;
	else if (depth <= 0) totalNodes = 1;
	else {
		for (const move of moves) {
			board.makeMove(move);
			const nodes = pBase(board, depth - 1);
			totalNodes += nodes;
			console.log(
				`${sqToAlgebraic(move.startSq)}${sqToAlgebraic(
					move.targetSq,
				)}: ${nodes}`,
			);
			board.unmakeMove();
		}
	}
	console.log('Nodes searched:', totalNodes);
}
