import Bitboard from './Bitboard.js';
import { Board } from './Board.js';
import { CastlingRights } from './CastlingRights.js';

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
	occupied = occupied.and(pc.not());
	let ortho = nortFill(pc).and(
		nortFill(occupied.urShift(8).and(soutFill(pc).not())).not(),
	);
	ortho = ortho.or(
		eastFill(pc).and(
			eastFill(occupied.lShift(1).and(westFill(pc).not())).not(),
		),
	);
	ortho = ortho.or(
		soutFill(pc).and(
			soutFill(occupied.lShift(8).and(nortFill(pc).not())).not(),
		),
	);
	ortho = ortho.or(
		westFill(pc).and(
			westFill(occupied.urShift(1).and(eastFill(pc).not())).not(),
		),
	);
	return ortho.xor(pc);
}

function getDiagonal(pc: Bitboard, occupied: Bitboard) {
	occupied = occupied.and(pc.not());
	let diagonal = noWeFill(pc).and(
		noWeFill(occupied.urShift(9).and(soEaFill(pc).not())).not(),
	);
	diagonal = diagonal.or(
		noEaFill(pc).and(
			noEaFill(occupied.urShift(7).and(soWeFill(pc).not())).not(),
		),
	);
	diagonal = diagonal.or(
		soEaFill(pc).and(
			soEaFill(occupied.lShift(9).and(noWeFill(pc).not())).not(),
		),
	);
	diagonal = diagonal.or(
		soWeFill(pc).and(
			soWeFill(occupied.lShift(7).and(noEaFill(pc).not())).not(),
		),
	);
	return diagonal.xor(pc);
}

function getKnight(pc: Bitboard, occupied: Bitboard) {
	occupied = occupied.and(pc.not());
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
	occupied = occupied.and(pc.not());
	const shf = clr ? 'urShift' : 'lShift';
	return pc[shf](8).and(occupied.not());
}

function getPawnDblPushes(pc: Bitboard, occupied: Bitboard, clr: 0 | 1) {
	occupied = occupied.and(pc.not());
	const shf = clr ? 'urShift' : 'lShift';
	const dblPushRank = clr ? new Bitboard(0, 0xff00) : new Bitboard(0xff0000);
	const singlePush = getPawnPushes(pc, occupied, clr);
	return singlePush.and(dblPushRank)[shf](8).and(occupied.not());
}

function getPawnAttacks(pc: Bitboard, occupied: Bitboard, clr: 0 | 1) {
	occupied = occupied.and(pc.not());
	const shf = clr ? 'urShift' : 'lShift';
	let pawn = pc[shf](9);
	return pawn.or(pc[shf](7));
}

function getKing(
	pc: Bitboard,
	occupied: Bitboard,
	enemyAttacks: Bitboard,
	castlingRights: CastlingRights,
	clr: 0 | 1,
) {
	occupied = occupied.and(pc.not());
	// normal moves
	let king = pc.urShift(9).and(notHFile);
	king = king.or(pc.urShift(8));
	king = king.or(pc.urShift(7).and(notAFile));
	king = king.or(pc.urShift(1).and(notHFile));
	king = king.or(pc.lShift(1).and(notAFile));
	king = king.or(pc.lShift(7).and(notHFile));
	king = king.or(pc.lShift(8));
	king = king.or(pc.lShift(9).and(notAFile));
	// castling
	if (enemyAttacks.and(pc).isEmpty()) {
		const occupiedAndAtk = occupied.or(enemyAttacks);
		if (castlingRights.can(clr, 0)) {
			king = king.or(
				pc
					.urShift(2)
					.and(
						westFill(occupiedAndAtk.and(eastFill(pc).not())).not(),
					),
			);
		}
		if (castlingRights.can(clr, 1)) {
			king = king.or(
				pc
					.lShift(2)
					.and(
						eastFill(occupiedAndAtk.and(westFill(pc).not())).not(),
					),
			);
		}
	}
	return king.and(enemyAttacks.not());
}

function getKingPair(
	blackKing: Bitboard,
	whiteKing: Bitboard,
	blackAttack: Bitboard,
	whiteAttack: Bitboard,
	occupied: Bitboard,
	castlingRights: CastlingRights,
) {
	const bkMoves = getKing(
		blackKing,
		occupied,
		whiteAttack,
		castlingRights,
		0,
	);
	const wkMoves = getKing(
		whiteKing,
		occupied,
		blackAttack,
		castlingRights,
		1,
	);
	return [bkMoves.and(wkMoves.not()), wkMoves.and(bkMoves.not())];
}

function getPinned(
	king: Bitboard,
	ally: Bitboard,
	enemy: Bitboard,
	enemyToCheck: Bitboard,
	gen: (pc: Bitboard, occupied: Bitboard) => Bitboard,
) {
	const occupied = ally.or(enemy);
	const possiblePins = gen(king, occupied).and(ally);
	const occupiedNoPinned = occupied.xor(possiblePins);
	const hitPinners = gen(king, occupiedNoPinned).and(enemyToCheck);
	const pinMoves = gen(hitPinners, occupiedNoPinned)
		.and(gen(king, occupiedNoPinned))
		.or(hitPinners);
	const pinned = pinMoves.and(possiblePins);
	return [pinned, pinMoves];
}

function pinGenWrapper(
	pc: Bitboard,
	pinned: Bitboard,
	pinMoves: Bitboard,
	occupied: Bitboard,
	gen: (...n: any) => Bitboard,
	...extraParams: any[]
) {
	const normalMoves = gen(pc.and(pinned.not()), occupied, ...extraParams);
	const pinnedMoves = gen(pinned.and(pc), occupied, ...extraParams).and(
		pinMoves,
	);
	return normalMoves.or(pinnedMoves);
}

export function GenerateBitboards(board: Board) {
	const bb = board.BB;
	const clr = board.activeClr;
	const whiteKing = bb.K;
	const blackKing = bb.k;
	const allWhite = bb.Q.or(whiteKing, bb.R, bb.B, bb.N, bb.P);
	const allBlack = bb.q.or(blackKing, bb.r, bb.b, bb.n, bb.p);
	const allWhiteNoKing = allWhite.xor(whiteKing);
	const allBlackNoKing = allBlack.xor(blackKing);
	const occupied = allBlack.or(allWhite);
	const occupiedNoKings = allBlackNoKing.or(allWhiteNoKing);

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

	let blackPseudoLegalAtks = getOrthogonal(bb.q, occupiedNoKings);
	blackPseudoLegalAtks = blackPseudoLegalAtks.or(
		getDiagonal(bb.q, occupiedNoKings),
	);
	blackPseudoLegalAtks = blackPseudoLegalAtks.or(
		getOrthogonal(bb.r, occupiedNoKings),
	);
	blackPseudoLegalAtks = blackPseudoLegalAtks.or(
		getDiagonal(bb.b, occupiedNoKings),
	);
	blackPseudoLegalAtks = blackPseudoLegalAtks.or(
		getKnight(bb.n, occupiedNoKings),
	);
	blackPseudoLegalAtks = blackPseudoLegalAtks.or(
		getPawnAttacks(bb.p, occupiedNoKings, 0),
	);
	let whitePseudoLegalAtks = getOrthogonal(bb.Q, occupiedNoKings);
	whitePseudoLegalAtks = whitePseudoLegalAtks.or(
		getDiagonal(bb.Q, occupiedNoKings),
	);
	whitePseudoLegalAtks = whitePseudoLegalAtks.or(
		getOrthogonal(bb.R, occupiedNoKings),
	);
	whitePseudoLegalAtks = whitePseudoLegalAtks.or(
		getDiagonal(bb.B, occupiedNoKings),
	);
	whitePseudoLegalAtks = whitePseudoLegalAtks.or(
		getKnight(bb.N, occupiedNoKings),
	);
	whitePseudoLegalAtks = whitePseudoLegalAtks.or(
		getPawnAttacks(bb.P, occupiedNoKings, 1),
	);
	const [blackKingMoves, whiteKingMoves] = getKingPair(
		blackKing,
		whiteKing,
		blackPseudoLegalAtks,
		whitePseudoLegalAtks,
		occupiedNoKings,
		board.castlingRights,
	);

	let checkCount = 0;
	const knightChecker = getKnight(clr ? bb.K : bb.k, occupied).and(
		clr ? bb.n : bb.N,
	);
	const pawnChecker = getPawnAttacks(
		clr ? bb.K : bb.k,
		occupiedNoKings,
		1,
	).and(clr ? bb.p : bb.P);
	const diagonalChecker = getDiagonal(clr ? bb.K : bb.k, occupied).and(
		(clr ? bb.b : bb.B).or(clr ? bb.q : bb.Q),
	);
	const orthogonalChecker = getOrthogonal(clr ? bb.K : bb.k, occupied).and(
		(clr ? bb.r : bb.R).or(clr ? bb.q : bb.Q),
	);
	let checkers = knightChecker.or(
		pawnChecker,
		diagonalChecker,
		orthogonalChecker,
	);

	const inKnightCheck = !knightChecker.isEmpty();
	const inPawnCheck = !pawnChecker.isEmpty();
	const inDiagonalCheck = !diagonalChecker.isEmpty();
	const inOrthogonalCheck = !orthogonalChecker.isEmpty();
	if (inKnightCheck) checkCount++;
	if (inPawnCheck) checkCount++;
	if (inDiagonalCheck) checkCount++;
	if (inOrthogonalCheck) checkCount++;

	let checkRays = new Bitboard();
	if (inDiagonalCheck) {
		checkRays = getDiagonal(diagonalChecker, occupied).and(
			getDiagonal(clr ? bb.K : bb.k, occupied),
		);
	}
	if (inOrthogonalCheck) {
		checkRays = getOrthogonal(orthogonalChecker, occupied).and(
			getOrthogonal(clr ? bb.K : bb.k, occupied),
		);
	}

	let canEnpassant = Boolean(board.enpassantSq);
	if (canEnpassant) {
		const possibleEPCapturers = (clr ? bb.P : bb.p).and(
			Bitboard.Mask(board.enpassantSq! + (clr ? 9 : -9)).or(
				Bitboard.Mask(board.enpassantSq! + (clr ? 7 : -7)),
			),
		);
		if (possibleEPCapturers.popCnt() === 1) {
			const occupiedNoEP = occupied.xor(
				possibleEPCapturers.or(
					Bitboard.Mask(board.enpassantSq! + (clr ? 8 : -8)),
				),
			);
			const orthogonalChecker = getOrthogonal(
				clr ? bb.K : bb.k,
				occupiedNoEP,
			).and((clr ? bb.r : bb.R).or(clr ? bb.q : bb.Q));
			if (orthogonalChecker.popCnt()) canEnpassant = false;
		}
	}

	return {
		checkCount,
		checkers,
		checkRays,
		validKingSqrs: clr ? whiteKingMoves : blackKingMoves,
		pinned: clr ? whitePinned : blackPinned,
		pinMoves: clr ? whitePinMoves : blackPinMoves,
		canEnpassant,
	};
}

export function getMobility(board: Board) {
	const bb = board.BB;
	const whiteKing = bb.K;
	const blackKing = bb.k;
	const allWhite = bb.Q.or(whiteKing, bb.R, bb.B, bb.N, bb.P);
	const allBlack = bb.q.or(blackKing, bb.r, bb.b, bb.n, bb.p);
	const allWhiteNoKing = allWhite.xor(whiteKing);
	const allBlackNoKing = allBlack.xor(blackKing);
	const occupied = allBlack.or(allWhite);
	const occupiedNoKings = allBlackNoKing.or(allWhiteNoKing);

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

	let blackPseudoLegalAtks = getOrthogonal(bb.q, occupiedNoKings);
	blackPseudoLegalAtks = blackPseudoLegalAtks.or(
		getDiagonal(bb.q, occupiedNoKings),
	);
	blackPseudoLegalAtks = blackPseudoLegalAtks.or(
		getOrthogonal(bb.r, occupiedNoKings),
	);
	blackPseudoLegalAtks = blackPseudoLegalAtks.or(
		getDiagonal(bb.b, occupiedNoKings),
	);
	blackPseudoLegalAtks = blackPseudoLegalAtks.or(
		getKnight(bb.n, occupiedNoKings),
	);
	blackPseudoLegalAtks = blackPseudoLegalAtks.or(
		getPawnAttacks(bb.p, occupiedNoKings, 0),
	);
	let whitePseudoLegalAtks = getOrthogonal(bb.Q, occupiedNoKings);
	whitePseudoLegalAtks = whitePseudoLegalAtks.or(
		getDiagonal(bb.Q, occupiedNoKings),
	);
	whitePseudoLegalAtks = whitePseudoLegalAtks.or(
		getOrthogonal(bb.R, occupiedNoKings),
	);
	whitePseudoLegalAtks = whitePseudoLegalAtks.or(
		getDiagonal(bb.B, occupiedNoKings),
	);
	whitePseudoLegalAtks = whitePseudoLegalAtks.or(
		getKnight(bb.N, occupiedNoKings),
	);
	whitePseudoLegalAtks = whitePseudoLegalAtks.or(
		getPawnAttacks(bb.P, occupiedNoKings, 1),
	);
	const [blackKingMoves, whiteKingMoves] = getKingPair(
		blackKing,
		whiteKing,
		blackPseudoLegalAtks,
		whitePseudoLegalAtks,
		occupiedNoKings,
		board.castlingRights,
	);

	let blackMoves = pinGenWrapper(
		bb.q,
		blackPinned,
		blackPinMoves,
		occupied,
		getOrthogonal,
	);
	blackMoves = pinGenWrapper(
		bb.q,
		blackPinned,
		blackPinMoves,
		occupied,
		getDiagonal,
	);
	blackMoves = pinGenWrapper(
		bb.r,
		blackPinned,
		blackPinMoves,
		occupied,
		getOrthogonal,
	);
	blackMoves = pinGenWrapper(
		bb.b,
		blackPinned,
		blackPinMoves,
		occupied,
		getDiagonal,
	);
	blackMoves = pinGenWrapper(
		bb.n,
		blackPinned,
		blackPinMoves,
		occupied,
		getKnight,
	);
	blackMoves = pinGenWrapper(
		bb.p,
		blackPinned,
		blackPinMoves,
		occupied,
		getPawnPushes,
		0,
	);
	blackMoves = pinGenWrapper(
		bb.p,
		blackPinned,
		blackPinMoves,
		occupied,
		getPawnDblPushes,
		0,
	);
	blackMoves = pinGenWrapper(
		bb.p,
		blackPinned,
		blackPinMoves,
		occupied,
		getPawnAttacks,
		0,
	);
	blackMoves = blackMoves.or(blackKingMoves);
	let whiteMoves = pinGenWrapper(
		bb.Q,
		whitePinned,
		whitePinMoves,
		occupied,
		getOrthogonal,
	);
	whiteMoves = pinGenWrapper(
		bb.Q,
		whitePinned,
		whitePinMoves,
		occupied,
		getDiagonal,
	);
	whiteMoves = pinGenWrapper(
		bb.R,
		whitePinned,
		whitePinMoves,
		occupied,
		getOrthogonal,
	);
	whiteMoves = pinGenWrapper(
		bb.B,
		whitePinned,
		whitePinMoves,
		occupied,
		getDiagonal,
	);
	whiteMoves = pinGenWrapper(
		bb.N,
		whitePinned,
		whitePinMoves,
		occupied,
		getKnight,
	);
	whiteMoves = pinGenWrapper(
		bb.P,
		whitePinned,
		whitePinMoves,
		occupied,
		getPawnPushes,
		0,
	);
	whiteMoves = pinGenWrapper(
		bb.P,
		whitePinned,
		whitePinMoves,
		occupied,
		getPawnDblPushes,
		0,
	);
	whiteMoves = pinGenWrapper(
		bb.P,
		whitePinned,
		whitePinMoves,
		occupied,
		getPawnAttacks,
		0,
	);
	whiteMoves = whiteMoves.or(whiteKingMoves);
	return [blackMoves.popCnt(), whiteMoves.popCnt()];
}
