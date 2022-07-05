import { readFen } from './fen.js';
import { perft } from './perft.js';
const startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const board = readFen(startFen);
perft(board, 5);
