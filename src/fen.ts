import Bitboard from './Bitboard.js';
import { Board, PieceChars } from './Board.js';

export function readFen(fen: string) {
	const board = new Board();
	const [
		placementData,
		activeClr,
		castling,
		enpassantSq,
		halfMoves,
		fullMoves,
	] = fen.split(' ');

	let x = 0;
	let y = 0;
	for (const char of placementData) {
		// Next row
		if (char === '/') {
			x = 0;
			y++;
		} else if (+char) x += +char; // skip columns
		else {
			// Add piece
			const i = y * 8 + x;
			const pcChar = char as PieceChars;
			board.pieces[i] = pcChar;
			board.BB[pcChar] = board.BB[pcChar].or(Bitboard.Mask(i));
			++x;
		}
	}

	board.activeClr = activeClr === 'b' ? 0 : 1;
	board.enpassantSq = +enpassantSq;
	board.halfMoves = +halfMoves;
	board.fullMoves = +fullMoves;

	if (castling !== '-') {
		for (const char of castling) {
			const lowercase = char.toLowerCase();
			const side = lowercase === 'q' ? 0 : 1;
			const clr = char === lowercase ? 0 : 1;
			if (board.pieces[(side ? 7 : 0) + (clr ? 7 : 0) * 8]) {
				board.castlingRights.set(clr, side, true);
			}
		}
	}

	return board;
}
// export function getFen(board: Board) {}
