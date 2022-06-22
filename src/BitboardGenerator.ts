import Bitboard from './Bitboard.js';
import { Board } from './Board.js';

function getClrPiecesUnion(board: Board) {
	const BB = board.BB;
	return [
		BB.k.or(BB.q, BB.r, BB.b, BB.n, BB.p),
		BB.K.or(BB.Q, BB.R, BB.B, BB.N, BB.P),
	];
}

const noTopEdge = new Bitboard(0xffffff00, 0xffffffff);
const noRightEdge = new Bitboard(0x7f7f7f7f, 0x7f7f7f7f);
const noBottomEdge = new Bitboard(0xffffffff, 0xffffff);
const noLeftEdge = new Bitboard(0xfefefefe, 0xfefefefe);
const noNwEdge = noTopEdge.and(noLeftEdge);
const noNeEdge = noTopEdge.and(noRightEdge);
const noSeEdge = noBottomEdge.and(noRightEdge);
const noSwEdge = noBottomEdge.and(noLeftEdge);
const knightUulSet = new Bitboard(0x7f7f7f7f, 0x7f7f);
const knightUurSet = new Bitboard(0xfefefefe, 0xfefe);
const knightDdrSet = new Bitboard(0x7f7f0000, 0x7f7f7f7f);
const knightDdlSet = new Bitboard(0xfefe0000, 0xfefefefe);
const knightRruSet = new Bitboard(0xfcfcfcfc, 0xfcfcfc);
const knightLluSet = new Bitboard(0x3f3f3f3f, 0x3f3f3f);
const knightLldSet = new Bitboard(0x3f3f3f00, 0x3f3f3f3f);
const knightRrdSet = new Bitboard(0xfcfcfc00, 0xfcfcfcfc);
const wTwoPush = new Bitboard(0, 0xff00);
const bTwoPush = new Bitboard(0xff0000, 0);
function getPawnBoards(
	board: Board,
	allBlackPcs: Bitboard,
	allWhitePcs: Bitboard,
) {
	const allPieces = allBlackPcs.or(allWhitePcs);
	const enPassantMask =
		board.enpassantSq === null
			? new Bitboard()
			: Bitboard.Mask(board.enpassantSq);
	return [board.BB.p, board.BB.P].map((bb, clr) => {
		const operation = clr ? 'urShift' : 'lShift';
		const enemyPieces = clr ? allBlackPcs : allWhitePcs;
		const twoPush = clr ? wTwoPush : bTwoPush;
		const pushBoard = bb[operation](8).and(allPieces.not());
		const doublePushBoard = pushBoard
			.and(twoPush)
			[operation](8)
			.and(allPieces.not());
		const leftCaptureBoard = bb[operation](9)
			.and(clr ? noRightEdge : noLeftEdge)
			.and(enemyPieces.or(enPassantMask));
		const rightCaptureBoard = bb[operation](7)
			.and(clr ? noLeftEdge : noRightEdge)
			.and(enemyPieces.or(enPassantMask));
		return leftCaptureBoard.or(
			rightCaptureBoard,
			pushBoard,
			doublePushBoard,
		);
	});
}

function getOrthogonalBoards(
	black: Bitboard,
	white: Bitboard,
	allBlackPcs: Bitboard,
	allWhitePcs: Bitboard,
) {
	const allBlackNot = allBlackPcs.not();
	const allWhiteNot = allWhitePcs.not();
	let blackTop = black;
	let whiteTop = white;
	let blackLeft = black;
	let whiteLeft = white;
	let blackBottom = black;
	let whiteBottom = white;
	let blackRight = black;
	let whiteRight = white;
	for (let i = 0; i < 8; i++) {
		blackTop = blackTop
			.or(blackTop.urShift(8))
			.and(noBottomEdge, allBlackNot, allWhiteNot.urShift(8));
		whiteTop = whiteTop
			.or(whiteTop.urShift(8))
			.and(noBottomEdge, allWhiteNot, allBlackNot.urShift(8));
		blackRight = blackRight
			.or(blackRight.lShift(1))
			.and(noLeftEdge, allBlackNot, allWhiteNot.lShift(1));
		whiteRight = whiteRight
			.or(whiteRight.lShift(1))
			.and(noLeftEdge, allWhiteNot, allBlackNot.lShift(1));
		blackLeft = blackLeft
			.or(blackLeft.urShift(1))
			.and(noRightEdge, allBlackNot, allWhiteNot.urShift(1));
		whiteLeft = whiteLeft
			.or(whiteLeft.urShift(1))
			.and(noRightEdge, allWhiteNot, allBlackNot.urShift(1));
		blackBottom = blackBottom
			.or(blackBottom.lShift(8))
			.and(noTopEdge, allBlackNot, allWhiteNot.lShift(8));
		whiteBottom = whiteBottom
			.or(whiteBottom.lShift(8))
			.and(noTopEdge, allWhiteNot, allBlackNot.lShift(8));
	}

	return [
		blackTop.or(blackRight, blackBottom, blackLeft),
		whiteTop.or(whiteRight, whiteBottom, whiteLeft),
	];
}

function getDiagonalBoards(
	black: Bitboard,
	white: Bitboard,
	allBlackPcs: Bitboard,
	allWhitePcs: Bitboard,
) {
	const allBlackNot = allBlackPcs.not();
	const allWhiteNot = allWhitePcs.not();
	let blackNW = black;
	let whiteNW = white;
	let blackNE = black;
	let whiteNE = white;
	let blackSE = black;
	let whiteSE = white;
	let blackSW = black;
	let whiteSW = white;
	for (let i = 0; i < 8; i++) {
		blackNW = blackNW.or(
			blackNW
				.urShift(9)
				.and(noSeEdge, allBlackNot, allWhiteNot.urShift(9)),
		);
		whiteNW = whiteNW.or(
			whiteNW
				.urShift(9)
				.and(noSeEdge, allWhiteNot, allBlackNot.urShift(9)),
		);
		blackNE = blackNE.or(
			blackNE
				.urShift(7)
				.and(noSwEdge, allBlackNot, allWhiteNot.urShift(7)),
		);
		whiteNE = whiteNE.or(
			whiteNE
				.urShift(7)
				.and(noSwEdge, allWhiteNot, allBlackNot.urShift(7)),
		);
		blackSE = blackSE.or(
			blackSE.lShift(9).and(noNwEdge, allBlackNot, allWhiteNot.lShift(9)),
		);
		whiteSE = whiteSE.or(
			whiteSE.lShift(9).and(noNwEdge, allWhiteNot, allBlackNot.lShift(9)),
		);
		blackSW = blackSW.or(
			blackSW.lShift(7).and(noNeEdge, allBlackNot, allWhiteNot.lShift(7)),
		);
		whiteSW = whiteSW.or(
			whiteSW.lShift(7).and(noNeEdge, allWhiteNot, allBlackNot.lShift(7)),
		);
	}
	return [
		blackNW.or(blackNE, blackSE, blackSW).xor(black),
		whiteNW.or(whiteNE, whiteSE, whiteSW).xor(white),
	];
}

function getKnightMoves(
	black: Bitboard,
	white: Bitboard,
	allBlackPcs: Bitboard,
	allWhitePcs: Bitboard,
) {
	const allBlackNot = allBlackPcs.not();
	const allWhiteNot = allWhitePcs.not();
	let blackMoves = black;
	let whiteMoves = white;
	blackMoves = black.urShift(17).and(knightUulSet).and(allBlackNot);
	whiteMoves = white.urShift(17).and(knightUulSet).and(allWhiteNot);
	blackMoves = blackMoves.or(
		black.urShift(15).and(knightUurSet, allBlackNot),
	);
	whiteMoves = whiteMoves.or(
		white.urShift(15).and(knightUurSet, allWhiteNot),
	);
	blackMoves = blackMoves.or(
		black.urShift(10).and(knightLluSet, allBlackNot),
	);
	whiteMoves = whiteMoves.or(
		white.urShift(10).and(knightLluSet, allWhiteNot),
	);
	blackMoves = blackMoves.or(black.urShift(6).and(knightRruSet, allBlackNot));
	whiteMoves = whiteMoves.or(white.urShift(6).and(knightRruSet, allWhiteNot));
	blackMoves = blackMoves.or(black.lShift(6).and(knightLldSet, allBlackNot));
	whiteMoves = whiteMoves.or(white.lShift(6).and(knightLldSet, allWhiteNot));
	blackMoves = blackMoves.or(black.lShift(10).and(knightRrdSet, allBlackNot));
	whiteMoves = whiteMoves.or(white.lShift(10).and(knightRrdSet, allWhiteNot));
	blackMoves = blackMoves.or(black.lShift(15).and(knightDdlSet, allBlackNot));
	whiteMoves = whiteMoves.or(white.lShift(15).and(knightDdlSet, allWhiteNot));
	blackMoves = blackMoves.or(black.lShift(17).and(knightDdrSet, allBlackNot));
	whiteMoves = whiteMoves.or(white.lShift(17).and(knightDdrSet, allWhiteNot));
	return [blackMoves, whiteMoves];
}

export function GenerateBitboards(board: Board) {
	const [allBlackPcs, allWhitePcs] = getClrPiecesUnion(board);
	const pawnMoves = getPawnBoards(board, allBlackPcs, allWhitePcs);
	const rookMoves = getOrthogonalBoards(
		board.BB.r,
		board.BB.R,
		allBlackPcs,
		allWhitePcs,
	);
	const bishopMoves = getDiagonalBoards(
		board.BB.b,
		board.BB.B,
		allBlackPcs,
		allWhitePcs,
	);
	const queenDiagonal = getDiagonalBoards(
		board.BB.q,
		board.BB.Q,
		allBlackPcs,
		allWhitePcs,
	);
	const queenOrthogonal = getOrthogonalBoards(
		board.BB.q,
		board.BB.Q,
		allBlackPcs,
		allWhitePcs,
	);
	const queenMoves = queenDiagonal.map((d, i) => d.or(queenOrthogonal[i]));
	const knightMoves = getKnightMoves(
		board.BB.n,
		board.BB.N,
		allBlackPcs,
		allWhitePcs,
	);
	knightMoves.forEach((bb) => console.log(bb.toString()));
}
