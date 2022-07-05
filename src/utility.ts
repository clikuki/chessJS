// For utility functions to be used throughout the program

import { PieceChars } from './Board.js';
export function getPieceCharClr(pieceChar: PieceChars) {
	return pieceChar === pieceChar.toLowerCase() ? 0 : 1;
}

const filesChars = ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
export function sqToAlgebraic(sq: number) {
	return (
		filesChars[sq % 8] + Math.abs(Math.floor(sq / 8) + 1 - 9).toString(10)
	);
}
