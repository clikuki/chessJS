import { Board } from './Board.js';
import { getPieceCharClr } from './utility.js';

interface MoveOptions {
	isEnpassant?: boolean;
	isDoublePush?: boolean;
	isCastling?: boolean;
	castlingSide?: 0 | 1;
}
export class Move {
	startSq: number;
	targetSq: number;
	options: MoveOptions;
	constructor(startSq: number, targetSq: number, options: MoveOptions = {}) {
		this.startSq = startSq;
		this.targetSq = targetSq;
		this.options = options;
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
	// normal movement
	for (let i = 0; i < 8; i++) {
		if (!sqDist[i]) continue;
		const targetSq = sq + offsets[i];
		const capturedPiece = board.pieces[targetSq];
		if (!capturedPiece || getPieceCharClr(capturedPiece) !== pieceClr) {
			moves.push(new Move(sq, targetSq));
		}
	}

	// Castling
	for (const [side, offset] of [
		[0, -2],
		[1, 2],
	] as const) {
		if (board.castlingRights.can(pieceClr, side))
			moves.push(
				new Move(sq, sq + offset, {
					isCastling: true,
					castlingSide: side,
				}),
			);
	}
	return moves;
}

function generatePawnMoves(board: Board, sq: number) {
	const moves: Move[] = [];
	const sqDist = distFromEdges[sq];
	const pieceChar = board.pieces[sq]!;
	const pieceClr = getPieceCharClr(pieceChar);
	const silentOffsetIndex = pieceClr ? 0 : 2;
	const captureOffsetIndices = pieceClr ? [4, 5] : [6, 7];

	const silentEdgeDist = sqDist[silentOffsetIndex];
	if (silentEdgeDist) {
		const silentOffset = offsets[silentOffsetIndex];
		const moveDistance = silentEdgeDist === 6 ? 2 : 1;
		for (let i = 1; i <= moveDistance; i++) {
			const targetSq = sq + silentOffset * i;
			if (board.pieces[targetSq]) break;
			moves.push(
				new Move(sq, targetSq, { isDoublePush: Boolean(i - 1) }),
			);
		}
	}

	for (const offsetIndex of captureOffsetIndices) {
		const offset = offsets[offsetIndex];
		const targetSq = sq + offset;
		const capturedPiece = board.pieces[targetSq];
		if (
			targetSq === board.enpassantSq ||
			(capturedPiece && getPieceCharClr(capturedPiece) !== pieceClr)
		) {
			moves.push(
				new Move(sq, targetSq, {
					isEnpassant: targetSq === board.enpassantSq,
				}),
			);
		}
	}
	return moves;
}

export function generatePseudoLegalMoves(board: Board) {
	const moves: Move[] = [];
	for (let sq = 0; sq < 64; sq++) {
		const piece = board.pieces[sq];
		if (!piece || getPieceCharClr(piece) !== board.activeClr) continue;
		switch (piece.toLowerCase()) {
			case 'q':
			case 'r':
			case 'b':
				moves.push(...generateSlidingMoves(board, sq));
				break;
			case 'n':
				moves.push(...generateKnightMoves(board, sq));
				break;
			case 'k':
				moves.push(...generateKingMoves(board, sq));
				break;
			case 'p':
				moves.push(...generatePawnMoves(board, sq));
				break;
		}
	}
	// console.log('done');
	return moves;
}