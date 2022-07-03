import { getMobility } from './BitboardGenerator';
import { Board } from './Board';

const wts = {
	// Pieces
	king: 200,
	queen: 9,
	rook: 5,
	minor: 3,
	pawn: 1,
	// Other
	mobility: 0.1,
	doubled: -0.5,
	blocked: -0.5,
	isolated: -0.5,
};

export function evaluate(board: Board) {
	const [bMobility, wMobility] = getMobility(board);
	let score = wts.king * (board.BB.K.popCnt() - board.BB.k.popCnt());
	score += wts.queen * (board.BB.Q.popCnt() - board.BB.q.popCnt());
	score += wts.rook * (board.BB.R.popCnt() - board.BB.r.popCnt());
	score += wts.minor * (board.BB.B.popCnt() - board.BB.b.popCnt());
	score += wts.minor * (board.BB.N.popCnt() - board.BB.n.popCnt());
	score += wts.pawn * (board.BB.P.popCnt() - board.BB.p.popCnt());
	score += wts.mobility * (wMobility - bMobility);
	return score * (board.activeClr || -1);
}
