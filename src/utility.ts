// For utility functions to be used throughout the program

import { PieceChars } from './Board.js';
export function getPieceCharClr(pieceChar: PieceChars) {
	return pieceChar === pieceChar.toLowerCase() ? 0 : 1;
}

const filesChars = 'abcdefgh';
const rankChars = '87654321';
export function sqToAlgebraic(sq: number) {
	return filesChars[sq % 8] + rankChars[Math.floor(sq / 8)];
}
