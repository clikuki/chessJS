import { Board } from './Board.js';
import { getPieceCharClr } from './utility.js';

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

const offsets = [-8, 1, 8, -1, /**/ -9, -7, 9, 7];
const distFromEdges = (() => {
	const distArr = [];

	for (let x = 0; x < 8; x++) {
		for (let y = 0; y < 8; y++) {
			const westDist = x;
			const eastDist = 7 - x;
			const northDist = y;
			const southDist = 7 - y;

			const index = x + y * 8;
			distArr[index] = [
				northDist,
				eastDist,
				southDist,
				westDist,
				Math.min(northDist, westDist),
				Math.min(northDist, eastDist),
				Math.min(southDist, eastDist),
				Math.min(southDist, westDist),
			];
		}
	}

	return distArr;
})();

function generateSlidingMoves(board: Board, sq: number) {
	const moves: Move[] = [];
	const pieceChar = board.pieces[sq]!;
	const lcPieceChar = pieceChar.toLowerCase();
	const pieceClr = getPieceCharClr(pieceChar);
	const sqDist = distFromEdges[sq];
	const start = lcPieceChar === 'b' ? 4 : 0;
	const end = lcPieceChar === 'r' ? 4 : 8;
	for (let i = start; i < end; i++) {
		const offset = offsets[i];
		const distFromEdge = sqDist[i];
		let targetSq = sq;
		for (let i = 0; i < distFromEdge; i++) {
			targetSq += offset;
			const capturedPiece = board.pieces[targetSq];
			if (capturedPiece && getPieceCharClr(capturedPiece) === pieceClr)
				break;
			moves.push(new Move(sq, targetSq));
			if (capturedPiece) break;
		}
	}
	return moves;
}

function generateKnightMoves(board: Board, sq: number) {
	const moves: Move[] = [];
	const pieceChar = board.pieces[sq]!;
	const pieceClr = getPieceCharClr(pieceChar);
	const offsetIndices = [
		[0, [4, 5]],
		[1, [5, 6]],
		[2, [6, 7]],
		[3, [4, 7]],
	] as const;
	for (const [firstOffsetIndex, secondOffsetIndices] of offsetIndices) {
		const midSq = sq + offsets[firstOffsetIndex];
		if (!distFromEdges[sq][firstOffsetIndex]) continue;
		for (const secondOffsetIndex of secondOffsetIndices) {
			const targetSq = midSq + offsets[secondOffsetIndex];
			if (!distFromEdges[midSq][secondOffsetIndex]) continue;
			const capturedPiece = board.pieces[targetSq];
			if (capturedPiece && getPieceCharClr(capturedPiece) === pieceClr)
				continue;
			moves.push(new Move(sq, targetSq));
			if (capturedPiece) continue;
		}
	}
	return moves;
}

function generateKingMoves(board: Board, sq: number) {
	const moves: Move[] = [];
	const pieceChar = board.pieces[sq]!;
	const pieceClr = getPieceCharClr(pieceChar);
	const sqDist = distFromEdges[sq];
	for (let i = 0; i < 8; i++) {
		if (!sqDist[i]) continue;
		const targetSq = sq + offsets[i];
		const capturedPiece = board.pieces[targetSq];
		if (!capturedPiece || getPieceCharClr(capturedPiece) !== pieceClr) {
			moves.push(new Move(sq, targetSq));
		}
	}
	return moves;
}

function generatePseudoLegalMoves(board: Board) {
	const moves: Move[] = [];
	for (let sq = 0; sq < 64; sq++) {
		const piece = board.pieces[sq];
		if (!piece || getPieceCharClr(piece) !== board.activeClr) continue;
		switch (piece) {
			case 'Q':
			case 'q':
			case 'R':
			case 'r':
			case 'B':
			case 'b':
				moves.push(...generateSlidingMoves(board, sq));
				break;
			case 'N':
			case 'n':
				moves.push(...generateKnightMoves(board, sq));
				break;
			case 'K':
			case 'k':
				moves.push(...generateKingMoves(board, sq));
				break;
		}
	}
	// console.log('done');
	return moves;
}

export function GenerateMoves(board: Board) {
	// TODO: added move legality checker
	return generatePseudoLegalMoves(board);
}
