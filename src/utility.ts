// For utility functions to be used throughout the program

import { PieceChars } from './Board.js';
export function getPieceCharClr(pieceChar: PieceChars) {
	return pieceChar === pieceChar.toLowerCase() ? 0 : 1;
}