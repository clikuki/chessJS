import Bitboard from './Bitboard.js';
import { Board } from './Board.js';

const notAFile = new Bitboard(0xfefefefe, 0xfefefefe);
const notHFile = new Bitboard(0x7f7f7f7f, 0x7f7f7f7f);
const knightUulSet = new Bitboard(0x7f7f7f7f, 0x7f7f);
const knightUurSet = new Bitboard(0xfefefefe, 0xfefe);
const knightDdrSet = new Bitboard(0x7f7f0000, 0x7f7f7f7f);
const knightDdlSet = new Bitboard(0xfefe0000, 0xfefefefe);
const knightRruSet = new Bitboard(0xfcfcfcfc, 0xfcfcfc);
const knightLluSet = new Bitboard(0x3f3f3f3f, 0x3f3f3f);
const knightLldSet = new Bitboard(0x3f3f3f00, 0x3f3f3f3f);
const knightRrdSet = new Bitboard(0xfcfcfc00, 0xfcfcfcfc);

function nortFill(bb: Bitboard) {
	bb = bb.or(bb.urShift(8));
	bb = bb.or(bb.urShift(16));
	bb = bb.or(bb.urShift(32));
	return bb;
}

function soutFill(bb: Bitboard) {
	bb = bb.or(bb.lShift(8));
	bb = bb.or(bb.lShift(16));
	bb = bb.or(bb.lShift(32));
	return bb;
}

function eastFill(bb: Bitboard) {
	const pr0 = notAFile;
	const pr1 = pr0.and(pr0.lShift(1));
	const pr2 = pr1.and(pr1.lShift(2));
	bb = bb.or(bb.lShift(1).and(pr0));
	bb = bb.or(bb.lShift(2).and(pr1));
	bb = bb.or(bb.lShift(4).and(pr2));
	return bb;
}

function noEaFill(bb: Bitboard) {
	const pr0 = notAFile;
	const pr1 = pr0.and(pr0.urShift(7));
	const pr2 = pr1.and(pr1.urShift(14));
	bb = bb.or(bb.urShift(7).and(pr0));
	bb = bb.or(bb.urShift(14).and(pr1));
	bb = bb.or(bb.urShift(28).and(pr2));
	return bb;
}

function soEaFill(bb: Bitboard) {
	const pr0 = notAFile;
	const pr1 = pr0.and(pr0.lShift(9));
	const pr2 = pr1.and(pr1.lShift(18));
	bb = bb.or(bb.lShift(9).and(pr0));
	bb = bb.or(bb.lShift(18).and(pr1));
	bb = bb.or(bb.lShift(36).and(pr2));
	return bb;
}

function westFill(bb: Bitboard) {
	const pr0 = notHFile;
	const pr1 = pr0.and(pr0.urShift(1));
	const pr2 = pr1.and(pr1.urShift(2));
	bb = bb.or(bb.urShift(1).and(pr0));
	bb = bb.or(bb.urShift(2).and(pr1));
	bb = bb.or(bb.urShift(4).and(pr2));
	return bb;
}

function soWeFill(bb: Bitboard) {
	const pr0 = notHFile;
	const pr1 = pr0.and(pr0.lShift(7));
	const pr2 = pr1.and(pr1.lShift(14));
	bb = bb.or(bb.lShift(7).and(pr0));
	bb = bb.or(bb.lShift(14).and(pr1));
	bb = bb.or(bb.lShift(28).and(pr2));
	return bb;
}

function noWeFill(bb: Bitboard) {
	const pr0 = notHFile;
	const pr1 = pr0.and(pr0.urShift(9));
	const pr2 = pr1.and(pr1.urShift(18));
	bb = bb.or(bb.urShift(9).and(pr0));
	bb = bb.or(bb.urShift(18).and(pr1));
	bb = bb.or(bb.urShift(36).and(pr2));
	return bb;
}

function getOrthogonal(pc: Bitboard, occupied: Bitboard) {
	occupied = occupied.xor(pc).and(occupied);
	let ortho = nortFill(pc).and(
		nortFill(occupied.and(soutFill(pc).not()))
			.xor(occupied)
			.not(),
	);
	ortho = ortho.or(
		eastFill(pc).and(
			eastFill(occupied.and(westFill(pc).not()))
				.xor(occupied)
				.not(),
		),
	);
	ortho = ortho.or(
		soutFill(pc).and(
			soutFill(occupied.and(nortFill(pc).not()))
				.xor(occupied)
				.not(),
		),
	);
	ortho = ortho.or(
		westFill(pc).and(
			westFill(occupied.and(eastFill(pc).not()))
				.xor(occupied)
				.not(),
		),
	);
	return ortho;
}

function getDiagonal(pc: Bitboard, occupied: Bitboard) {
	occupied = occupied.xor(pc).and(occupied);
	let diagonal = noWeFill(pc).and(
		noWeFill(occupied.and(soEaFill(pc).not()))
			.xor(occupied)
			.not(),
	);
	diagonal = diagonal.or(
		noEaFill(pc).and(
			noEaFill(occupied.and(soWeFill(pc).not()))
				.xor(occupied)
				.not(),
		),
	);
	diagonal = diagonal.or(
		soEaFill(pc).and(
			soEaFill(occupied.and(noWeFill(pc).not()))
				.xor(occupied)
				.not(),
		),
	);
	diagonal = diagonal.or(
		soWeFill(pc).and(
			soWeFill(occupied.and(noEaFill(pc).not()))
				.xor(occupied)
				.not(),
		),
	);
	return diagonal;
}

function getKnight(pc: Bitboard, occupied: Bitboard) {
	occupied = occupied.xor(pc).and(occupied);
	let knight = pc.urShift(17).and(knightUulSet);
	knight = knight.or(pc.urShift(15).and(knightUurSet));
	knight = knight.or(pc.urShift(10).and(knightLluSet));
	knight = knight.or(pc.urShift(6).and(knightRruSet));
	knight = knight.or(pc.lShift(6).and(knightLldSet));
	knight = knight.or(pc.lShift(10).and(knightRrdSet));
	knight = knight.or(pc.lShift(15).and(knightDdlSet));
	knight = knight.or(pc.lShift(17).and(knightDdrSet));
	return knight;
}

function getPawnPushes(pc: Bitboard, occupied: Bitboard, clr: 0 | 1) {
	occupied = occupied.xor(pc).and(occupied);
	const shf = clr ? 'urShift' : 'lShift';
	return pc[shf](8).and(occupied.not());
}

function getPawnDblPushes(pc: Bitboard, occupied: Bitboard, clr: 0 | 1) {
	occupied = occupied.xor(pc).and(occupied);
	const shf = clr ? 'urShift' : 'lShift';
	const dblPushRank = clr ? new Bitboard(0, 0xff00) : new Bitboard(0xff0000);
	const singlePush = getPawnPushes(pc, occupied, clr);
	return singlePush.and(dblPushRank)[shf](8).and(occupied.not());
}

function getPawnAttacks(
	pc: Bitboard,
	occupied: Bitboard,
	clr: 0 | 1,
	enpassantSq: number | null,
) {
	occupied = occupied.xor(pc).and(occupied);
	const enpassant = enpassantSq ? Bitboard.Mask(enpassantSq) : new Bitboard();
	const attackable = occupied.or(enpassant);
	const shf = clr ? 'urShift' : 'lShift';
	let pawn = pc[shf](9).and(attackable);
	return pawn.or(pc[shf](7).and(attackable));
}

function getKing(pc: Bitboard, occupied: Bitboard, enemyAttacks: Bitboard) {
	occupied = occupied.xor(pc).and(occupied);
	let king = pc.urShift(9);
	king = king.or(pc.urShift(8));
	king = king.or(pc.urShift(7));
	king = king.or(pc.urShift(1));
	king = king.or(pc.lShift(1));
	king = king.or(pc.lShift(7));
	king = king.or(pc.lShift(8));
	king = king.or(pc.lShift(9));
	return king.and(enemyAttacks.not());
}

function getKingPair(
	blackKing: Bitboard,
	whiteKing: Bitboard,
	blackAttack: Bitboard,
	whiteAttack: Bitboard,
	occupied: Bitboard,
) {
	const bkMoves = getKing(blackKing, occupied, whiteAttack);
	const wkMoves = getKing(whiteKing, occupied, blackAttack);
	return [bkMoves.and(wkMoves.not()), wkMoves.and(bkMoves.not())];
}

function getPinned(
	king: Bitboard,
	ally: Bitboard,
	enemy: Bitboard,
	enemyCheck: Bitboard,
	gen: (pc: Bitboard, occupied: Bitboard) => Bitboard,
) {
	const occupied = ally.or(enemy);
	const kingAtk = gen(king, occupied);
	const enemyAtk = gen(enemyCheck, occupied);
	const pinned = ally.and(kingAtk, enemyAtk);
	const pinnedMoves = gen(king, occupied.xor(pinned)).and(
		gen(enemyCheck, occupied.xor(pinned)),
	);
	return [pinned, pinnedMoves];
}

function pinGenWrapper(
	pc: Bitboard,
	pinned: Bitboard,
	pinMoves: Bitboard,
	occupied: Bitboard,
	gen: (...n: any) => Bitboard,
	...extraParams: any[]
) {
	const normalMoves = gen(pc.xor(pinned).and(pc), occupied, ...extraParams);
	const pinnedMoves = gen(pinned, occupied, ...extraParams).and(pinMoves);
	return normalMoves.or(pinnedMoves);
}

export function GenerateBitboards(board: Board) {
	const bb = board.BB;
	const whiteKing = bb.K;
	const blackKing = bb.k;
	const allWhite = bb.Q.or(whiteKing, bb.R, bb.B, bb.N, bb.P);
	const allBlack = bb.q.or(blackKing, bb.r, bb.b, bb.n, bb.p);
	const allWhiteNoKing = allWhite.xor(whiteKing);
	const allBlackNoKing = allBlack.xor(blackKing);
	const occupied = allBlackNoKing.or(allWhiteNoKing);

	const [whiteDiagonalPins, whiteDiagonalPinMoves] = getPinned(
		whiteKing,
		allWhiteNoKing,
		allBlackNoKing,
		bb.b.or(bb.q),
		getDiagonal,
	);
	const [whiteOrthogonalPins, whiteOrthogonalPinMoves] = getPinned(
		whiteKing,
		allWhiteNoKing,
		allBlackNoKing,
		bb.r.or(bb.q),
		getOrthogonal,
	);
	const [blackDiagonalPins, blackDiagonalPinMoves] = getPinned(
		blackKing,
		allBlackNoKing,
		allWhiteNoKing,
		bb.B.or(bb.Q),
		getDiagonal,
	);
	const [blackOrthogonalPins, blackOrthogonalPinMoves] = getPinned(
		blackKing,
		allBlackNoKing,
		allWhiteNoKing,
		bb.R.or(bb.Q),
		getOrthogonal,
	);
	const blackPinned = blackDiagonalPins.or(blackOrthogonalPins);
	const blackPinMoves = blackDiagonalPinMoves.or(blackOrthogonalPinMoves);
	const whitePinned = whiteDiagonalPins.or(whiteOrthogonalPins);
	const whitePinMoves = whiteDiagonalPinMoves.or(whiteOrthogonalPinMoves);

	const blackRookMoves = pinGenWrapper(
		bb.r,
		blackPinned,
		blackPinMoves,
		occupied,
		getOrthogonal,
	);
	const blackBishopMoves = pinGenWrapper(
		bb.b,
		blackPinned,
		blackPinMoves,
		occupied,
		getDiagonal,
	);
	const blackQueenMoves = pinGenWrapper(
		bb.q,
		blackPinned,
		blackPinMoves,
		occupied,
		(pc: Bitboard, occupied: Bitboard) =>
			getOrthogonal(pc, occupied).or(getDiagonal(pc, occupied)),
	);
	const blackKnightMoves = pinGenWrapper(
		bb.n,
		blackPinned,
		blackPinMoves,
		occupied,
		getKnight,
	);
	const blackPawnPushes = pinGenWrapper(
		bb.p,
		blackPinned,
		blackPinMoves,
		occupied,
		getPawnPushes,
		0,
	);
	const blackPawnDblPushes = pinGenWrapper(
		bb.p,
		blackPinned,
		blackPinMoves,
		occupied,
		getPawnDblPushes,
		0,
	);
	const blackPawnAtks = pinGenWrapper(
		bb.p,
		blackPinned,
		blackPinMoves,
		occupied,
		getPawnAttacks,
		0,
		board.enpassantSq,
	);
	let blackMoves = blackQueenMoves.or(
		blackRookMoves,
		blackBishopMoves,
		blackKnightMoves,
		blackPawnPushes,
		blackPawnDblPushes,
		blackPawnAtks,
	);

	const whiteRookMoves = pinGenWrapper(
		bb.R,
		whitePinned,
		whitePinMoves,
		occupied,
		getOrthogonal,
	);
	const whiteBishopMoves = pinGenWrapper(
		bb.B,
		whitePinned,
		whitePinMoves,
		occupied,
		getDiagonal,
	);
	const whiteQueenMoves = pinGenWrapper(
		bb.Q,
		whitePinned,
		whitePinMoves,
		occupied,
		(pc: Bitboard, occupied: Bitboard) =>
			getOrthogonal(pc, occupied).or(getDiagonal(pc, occupied)),
	);
	const whiteKnightMoves = pinGenWrapper(
		bb.N,
		whitePinned,
		whitePinMoves,
		occupied,
		getKnight,
	);
	const whitePawnPushes = pinGenWrapper(
		bb.P,
		whitePinned,
		whitePinMoves,
		occupied,
		getPawnPushes,
		0,
	);
	const whitePawnDblPushes = pinGenWrapper(
		bb.P,
		whitePinned,
		whitePinMoves,
		occupied,
		getPawnDblPushes,
		0,
	);
	const whitePawnAtks = pinGenWrapper(
		bb.P,
		whitePinned,
		whitePinMoves,
		occupied,
		getPawnAttacks,
		0,
		board.enpassantSq,
	);
	let whiteMoves = whiteQueenMoves.or(
		whiteRookMoves,
		whiteBishopMoves,
		whiteKnightMoves,
		whitePawnPushes,
		whitePawnDblPushes,
		whitePawnAtks,
	);

	let blackPseudoLegalAtks = getOrthogonal(bb.r.or(bb.q), occupied);
	blackPseudoLegalAtks = blackPseudoLegalAtks.or(
		getDiagonal(bb.b.or(bb.q), occupied),
	);
	blackPseudoLegalAtks = blackPseudoLegalAtks.or(getKnight(bb.n, occupied));
	blackPseudoLegalAtks = blackPseudoLegalAtks.or(
		getPawnAttacks(bb.p, occupied, 0, board.enpassantSq),
	);
	let whitePseudoLegalAtks = getOrthogonal(bb.R.or(bb.Q), occupied);
	whitePseudoLegalAtks = whitePseudoLegalAtks.or(
		getDiagonal(bb.B.or(bb.Q), occupied),
	);
	whitePseudoLegalAtks = whitePseudoLegalAtks.or(getKnight(bb.N, occupied));
	whitePseudoLegalAtks = whitePseudoLegalAtks.or(
		getPawnAttacks(bb.P, occupied, 1, board.enpassantSq),
	);
	const [blackKingMoves, whiteKingMoves] = getKingPair(
		blackKing,
		whiteKing,
		blackPseudoLegalAtks,
		whitePseudoLegalAtks,
		occupied,
	);

	// const blackCheckCount = [
	// 	getKnight(bb.N, occupied).and(bb.P),
	// 	getPawnAttacks(bb.P, occupied, 1, board.enpassantSq).and(bb.P),
	// 	getDiagonal(bb.B.or(bb.Q), occupied).and(bb.B.or(bb.Q)),
	// 	getOrthogonal(bb.R.or(bb.Q), occupied).and(bb.R.or(bb.Q)),
	// ].filter((checker) => !checker.isEmpty()).length;
	// const whiteCheckCount = [
	// 	getKnight(bb.n, occupied).and(bb.p),
	// 	getPawnAttacks(bb.p, occupied, 0, board.enpassantSq).and(bb.p),
	// 	getDiagonal(bb.b.or(bb.q), occupied).and(bb.b.or(bb.q)),
	// 	getOrthogonal(bb.r.or(bb.q), occupied).and(bb.r.or(bb.q)),
	// ].filter((checker) => !checker.isEmpty()).length;
	// const checkCount = Math.max(blackCheckCount, whiteCheckCount);
	// [
	// 	board.activeClr
	// 		? getKnight(bb.K, occupied).and(bb.p)
	// 		: getKnight(bb.k, occupied).and(bb.P),
	// 	board.activeClr
	// 		? getPawnAttacks(bb.K, occupied, 0, board.enpassantSq).and(bb.p)
	// 		: getPawnAttacks(bb.k, occupied, 1, board.enpassantSq).and(bb.P),
	// 	board.activeClr
	// 		? getDiagonal(bb.K, occupied).and(bb.b.or(bb.q))
	// 		: getDiagonal(bb.k, occupied).and(bb.B.or(bb.Q)),
	// 	board.activeClr
	// 		? getOrthogonal(bb.K, occupied).and(bb.r.or(bb.q))
	// 		: getOrthogonal(bb.k, occupied).and(bb.R.or(bb.Q)),
	// ]

	let checkCount = 0;
	let attacks = new Bitboard();

	return {
		checkCount,
		validBlackKingSqrs: blackKingMoves,
		validWhiteKingSqrs: whiteKingMoves,
		blackMoves,
		whiteMoves,
		whitePinned,
		blackPinned,
		whitePinMoves,
		blackPinMoves,
	};
}
