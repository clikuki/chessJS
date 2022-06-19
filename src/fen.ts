import { Board } from './Board.js';
import { Piece } from './Piece.js';

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

	board.activeClr = activeClr === 'b' ? 0 : 1;
	board.enpassantSq = +enpassantSq;
	board.halfMoves = +halfMoves;
	board.fullMoves = +fullMoves;

	for (const char of castling) {
		const lowercase = char.toLowerCase();
		const side = lowercase === 'q' ? 0 : 1;
		const clr = char === lowercase ? 0 : 1;
		board.castlingRights.set(clr, side, true);
	}

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
			const pieceChar = char.toLowerCase();
			const clr = char === pieceChar ? 0 : 1;
			const piece = new Piece(pieceChar, clr);
			board.tiles[i].add(piece);
			++x;
		}
	}
	return board;
}
// export function getFen(board: Board) {}
