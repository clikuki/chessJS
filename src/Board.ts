import { Bitboard } from './Bitboard.js';
import { GenerateBitboards } from './BitboardGenerator.js';
import { generatePseudoLegalMoves, Move } from './MoveGenerator.js';
import { getPieceCharClr } from './utility.js';
import { CastlingRights } from './CastlingRights.js';

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

interface UnmakeMoveInfo {
	startSq: number;
	targetSq: number;
	moved: PieceChars;
	captured: PieceChars | null;
	halfMoves: number;
	fullMoves: number;
	BB: Partial<BBGroup>;
	enPassant?: {
		captureSq: number;
	};
	castle?: {
		oldRookSq: number;
		newRookSq: number;
	};
	affectedCastlingRights?: {
		kingSide: boolean;
		queenSide: boolean;
	};
}

export class Board {
	activeClr: 0 | 1 = 1;
	castlingRights = new CastlingRights();
	enpassantSq: number | null = null;
	halfMoves = 0;
	fullMoves = 1;
	BB = new BBGroup();
	pieces: (PieceChars | null)[] = new Array(64).fill(null);
	moves: Move[] = [];
	unmakeMvInfoArr: UnmakeMoveInfo[] = [];
	makeMove(move: Move) {
		const movedPiece = this.pieces[move.startSq];
		if (!movedPiece) return;
		const captureSq =
			move.options?.isEnpassant && this.enpassantSq
				? this.enpassantSq + (this.activeClr ? 8 : -8)
				: move.targetSq;
		const capturedPiece = this.pieces[captureSq];

		const unmakeMoveInfo: UnmakeMoveInfo = {
			startSq: move.startSq,
			targetSq: move.targetSq,
			moved: movedPiece,
			captured: capturedPiece,
			halfMoves: this.halfMoves,
			fullMoves: this.fullMoves,
			BB: {
				[movedPiece]: this.BB[movedPiece],
			},
		};
		if (move.options?.isEnpassant) unmakeMoveInfo.enPassant = { captureSq };
		if (capturedPiece)
			unmakeMoveInfo.BB[capturedPiece] = this.BB[capturedPiece];

		// Update pieces array
		this.pieces[move.startSq] = null;
		this.pieces[captureSq] = null;
		this.pieces[move.targetSq] = movedPiece;
		if (move.options?.isPromotion && move.options.promoteTo) {
			this.pieces[move.targetSq] = move.options.promoteTo;
		} else if (move.options?.isCastling) {
			const side = move.options.castlingSide!;
			const oldRookSq = move.targetSq + (side ? 1 : -2);
			const newRookSq = move.targetSq + (side ? -1 : 1);
			unmakeMoveInfo.castle = {
				oldRookSq,
				newRookSq,
			};
			[this.pieces[oldRookSq], this.pieces[newRookSq]] = [
				this.pieces[newRookSq],
				this.pieces[oldRookSq],
			];
		}

		// Update bitboards
		this.BB[movedPiece] = this.BB[movedPiece].xor(
			Bitboard.Mask(move.startSq),
		);
		if (capturedPiece)
			this.BB[capturedPiece] = this.BB[capturedPiece].xor(
				Bitboard.Mask(captureSq),
			);
		if (move.options?.isPromotion && move.options.promoteTo) {
			unmakeMoveInfo.BB[move.options.promoteTo] =
				this.BB[move.options.promoteTo];
			this.BB[move.options.promoteTo] = this.BB[
				move.options.promoteTo
			].or(Bitboard.Mask(move.targetSq));
		} else {
			this.BB[movedPiece] = this.BB[movedPiece].or(
				Bitboard.Mask(move.targetSq),
			);
			if (move.options?.isCastling) {
				const side = move.options.castlingSide!;
				const oldRookPosition = move.targetSq + (side ? 1 : -2);
				const newRookPosition = move.targetSq + (side ? -1 : 1);
				const rookChar = this.activeClr ? 'R' : 'r';
				unmakeMoveInfo.BB[rookChar] = this.BB[rookChar];
				this.BB[rookChar] = this.BB[rookChar]
					.xor(Bitboard.Mask(oldRookPosition))
					.or(Bitboard.Mask(newRookPosition));
			}
		}

		// Update castling rights
		if (
			movedPiece.toLowerCase() === 'k' &&
			this.castlingRights.canColor(this.activeClr)
		) {
			unmakeMoveInfo.affectedCastlingRights = {
				queenSide: this.castlingRights.can(this.activeClr, 0),
				kingSide: this.castlingRights.can(this.activeClr, 1),
			};
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
					unmakeMoveInfo.affectedCastlingRights = {
						queenSide: this.castlingRights.can(this.activeClr, 0),
						kingSide: this.castlingRights.can(this.activeClr, 1),
					};
					this.castlingRights.set(color, side as 0 | 1, false);
				}
			});

		if (move.options?.isDoublePush) {
			this.enpassantSq = move.targetSq + (this.activeClr ? 8 : -8);
		} else this.enpassantSq = null;
		if (capturedPiece || movedPiece === 'P' || movedPiece === 'p')
			this.halfMoves = 0;
		else this.halfMoves++;
		if (!this.activeClr) this.fullMoves++;
		this.activeClr = this.activeClr ? 0 : 1;
		this.unmakeMvInfoArr.push(unmakeMoveInfo);
	}
	unmakeMove() {
		const unmakeMoveInfo = this.unmakeMvInfoArr.pop();
		if (!unmakeMoveInfo) return;
		this.activeClr = this.activeClr ? 0 : 1;
		const { moved, captured } = unmakeMoveInfo;
		this.pieces[unmakeMoveInfo.startSq] = moved;
		this.pieces[unmakeMoveInfo.targetSq] = null;
		if (unmakeMoveInfo.enPassant)
			this.pieces[unmakeMoveInfo.enPassant.captureSq] = captured;
		else this.pieces[unmakeMoveInfo.targetSq] = captured;
		if (unmakeMoveInfo.castle) {
			const rookChar = this.pieces[unmakeMoveInfo.castle.newRookSq];
			this.pieces[unmakeMoveInfo.castle.newRookSq] = null;
			this.pieces[unmakeMoveInfo.castle.oldRookSq] = rookChar;
		}

		if (unmakeMoveInfo.affectedCastlingRights) {
			const { queenSide, kingSide } =
				unmakeMoveInfo.affectedCastlingRights;
			this.castlingRights.set(this.activeClr, 0, queenSide);
			this.castlingRights.set(this.activeClr, 1, kingSide);
		}

		for (const key in unmakeMoveInfo.BB) {
			// @ts-ignore; possible to do this without using @ts-ignore but this is easier
			this.BB[key] = unmakeMoveInfo.BB[key];
		}

		this.halfMoves = unmakeMoveInfo.halfMoves;
		this.fullMoves = unmakeMoveInfo.fullMoves;
	}
	generateMoves() {
		const mvLegality = GenerateBitboards(this);
		return (this.moves = generatePseudoLegalMoves(
			this,
			mvLegality.pinned,
			mvLegality.pinMoves,
			mvLegality.validKingSqrs,
			mvLegality.checkCount,
			mvLegality.checkers,
			mvLegality.checkRays,
			mvLegality.canEnpassant,
		));
	}
}

const castlingEligibleRookPositions = [
	[0, 7],
	[56, 63],
];
