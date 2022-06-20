import { Bitboard } from './Bitboard.js';
import { Move } from './MoveGeneration.js';
import { getPieceCharClr } from './utility.js';

class CastlingRights {
	// black queen, black king, white queen, white king
	rights = [false, false, false, false];
	can(color: 0 | 1, side: 0 | 1) {
		return this.rights[color * 2 + side];
	}
	set(color: 0 | 1, side: 0 | 1, right: boolean) {
		this.rights[color * 2 + side] = right;
	}
	setColor(color: 0 | 1, right: boolean) {
		this.rights[color * 2 + 0] = right;
		this.rights[color * 2 + 1] = right;
	}
}

class BBGroup {
	// White
	K = new Bitboard();
	Q = new Bitboard();
	R = new Bitboard();
	B = new Bitboard();
	N = new Bitboard();
	P = new Bitboard();
	// Black
	k = new Bitboard();
	q = new Bitboard();
	r = new Bitboard();
	b = new Bitboard();
	n = new Bitboard();
	p = new Bitboard();
}

export type PieceChars =
	| 'k'
	| 'q'
	| 'r'
	| 'b'
	| 'n'
	| 'p'
	| 'K'
	| 'Q'
	| 'R'
	| 'B'
	| 'N'
	| 'P';

export class Board {
	activeClr: 0 | 1 = 1;
	castlingRights = new CastlingRights();
	enpassantSq: number | null = null;
	halfMoves = 0;
	fullMoves = 1;
	BB = new BBGroup();
	pieces: (PieceChars | null)[] = new Array(64).fill(null);
	makeMove(move: Move) {
		const movedPiece = this.pieces[move.startSq];
		if (!movedPiece) return;
		const captureSq =
			move.isEnpassant && this.enpassantSq
				? this.enpassantSq
				: move.targetSq;
		const capturedPiece = this.pieces[captureSq];

		// Update pieces array
		this.pieces[move.startSq] = null;
		this.pieces[move.targetSq] = movedPiece;

		// Update bitboards
		this.BB[movedPiece] = this.BB[movedPiece]
			.xor(Bitboard.Mask(move.startSq))
			.or(Bitboard.Mask(move.targetSq));
		if (capturedPiece)
			this.BB[capturedPiece] = this.BB[capturedPiece].xor(
				Bitboard.Mask(captureSq),
			);

		// Update castling rights
		if (movedPiece.toLowerCase() === 'k') {
			this.castlingRights.setColor(this.activeClr, false);
		} else
			(
				[
					[movedPiece, move.startSq],
					[capturedPiece, captureSq],
				] as const
			).forEach(([piece, sq]) => {
				if (piece && piece.toLowerCase() === 'r') {
					const color = getPieceCharClr(piece);
					const side = castlingEligibleRookPositions[color].findIndex(
						(v) => v === sq,
					);
					if (side === -1) return;
					this.castlingRights.set(color, side as 0 | 1, false);
				}
			});

		this.enpassantSq = null;
		if (capturedPiece || movedPiece === 'P' || movedPiece === 'p')
			this.halfMoves = 0;
		else this.halfMoves++;
		if (!this.activeClr) this.fullMoves++;
		this.activeClr = this.activeClr ? 0 : 1;
	}
}

const castlingEligibleRookPositions = [
	[0, 7],
	[56, 63],
];
