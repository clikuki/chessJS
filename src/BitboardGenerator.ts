import Bitboard from './Bitboard.js';
import { Board } from './Board.js';

function getClrPiecesUnion(board: Board) {
	const BB = board.BB;
	return [
		BB.k.or(BB.q, BB.r, BB.b, BB.n, BB.p),
		BB.K.or(BB.Q, BB.R, BB.B, BB.N, BB.P),
	];
}

const noRightEdge = new Bitboard(0x7f7f7f7f, 0x7f7f7f7f);
const noLeftEdge = new Bitboard(0xfefefefe, 0xfefefefe);
const noBottomEdge = new Bitboard(0xffffffff, 0xffffff);
const noTopEdge = new Bitboard(0xffffff00, 0xffffffff);
const wTwoPush = new Bitboard(0, 0xff00);
const bTwoPush = new Bitboard(0xff0000, 0);
function getPawnMoves(
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

function getRookMoves(
	board: Board,
	allBlackPcs: Bitboard,
	allWhitePcs: Bitboard,
) {
	const black = board.BB.r;
	const white = board.BB.R;
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

export function GenerateBitboards(board: Board) {
	const [allBlackPcs, allWhitePcs] = getClrPiecesUnion(board);
	const pawnMoves = getPawnMoves(board, allBlackPcs, allWhitePcs);
	const rookMoves = getRookMoves(board, allBlackPcs, allWhitePcs);
	rookMoves.forEach((bb) => console.log(bb.toString()));
}
