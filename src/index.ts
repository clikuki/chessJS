import { readFen } from './fen.js';
import { ImageSrcContainer, imgSrcs } from './loadImages.js';
import { getPieceCharClr } from './utility.js';

// Get tile size
const computedStyles = getComputedStyle(document.documentElement);
const tileSizeInRem = parseFloat(
	computedStyles.getPropertyValue('--tile-size'),
);
const fontSize = parseFloat(computedStyles.fontSize);
const tileSize = tileSizeInRem * fontSize;

// Load up board
// const startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const startFen = '8/3kKp2/3nN3/3qQ3/3rR3/3bB3/2P5/8 w - - 0 1';
const board = readFen(startFen);
board.generateMoves();

// Create dom representation
const grid = document.createElement('div');
const imgs: (HTMLImageElement | null)[] = [];
const tiles: HTMLElement[] = [];
grid.classList.add('grid');
for (let j = 0; j < 8; j++) {
	for (let i = 0; i < 8; i++) {
		const tile = document.createElement('div');
		tile.classList.add('tile', (i + j) % 2 ? 'light' : 'dark');
		const index = i + j * 8;

		if (board.pieces[index]) {
			const char = board.pieces[index]!;
			const name = `${char.toLowerCase()}${
				char.toLowerCase() === char ? 'd' : 'l'
			}`;
			const imgSrc = imgSrcs[name as keyof ImageSrcContainer];
			const img = document.createElement('img');
			img.src = imgSrc;
			tile.appendChild(img);
			imgs[index] = img;
		} else imgs[index] = null;

		tiles[index] = tile;
		grid.appendChild(tile);
	}
}
document.body.appendChild(grid);

function getXY(e: MouseEvent) {
	return {
		x: e.pageX,
		y: e.pageY,
	};
}

function setXYOnElement(element: HTMLElement, x: number, y: number) {
	element.style.setProperty('--x', `${x}px`);
	element.style.setProperty('--y', `${y}px`);
}

function setDragging(element: HTMLElement, draggable: boolean) {
	if (draggable) element.classList.add('dragging');
	else element.classList.remove('dragging');
}

function getSq(x: number, y: number) {
	return Math.floor(x / tileSize) + Math.floor(y / tileSize) * 8;
}

function findMove(startSq: number, targetSq: number) {
	return (
		board.moves.find(
			(move) => move.startSq === startSq && move.targetSq === targetSq,
		) || null
	);
}

function canTakeSq(startSq: number, targetSq: number) {
	const moved = board.pieces[startSq];
	const captured = board.pieces[targetSq];
	if (!moved) throw 'Moved piece is null';
	return !captured || getPieceCharClr(captured) !== getPieceCharClr(moved);
}

let startSq: number | null = null;
grid.addEventListener('mousedown', (e) => {
	e.stopPropagation();
	const { x, y } = getXY(e);
	const sq = getSq(x, y);
	const piece = board.pieces[sq];
	if (!piece || getPieceCharClr(piece) !== board.activeClr) return;
	const img = imgs[sq]!;
	setXYOnElement(img, x, y);
	setDragging(img, true);
	startSq = sq;
});
grid.addEventListener('mousemove', (e) => {
	if (!startSq) return;
	const { x, y } = getXY(e);
	const img = imgs[startSq]!;
	setXYOnElement(img, x, y);
});
grid.addEventListener('mouseup', (e) => {
	if (!startSq) return;
	const img = imgs[startSq]!;
	const { x, y } = getXY(e);
	const sq = getSq(x, y);
	const move = findMove(startSq, sq);
	if (move && canTakeSq(startSq, sq)) {
		imgs[startSq] = null;
		if (board.enpassantSq === sq) {
			const captureSq = sq + (board.activeClr ? 8 : -8);
			imgs[captureSq]!.remove();
			imgs[captureSq] = null;
		} else {
			imgs[sq]?.remove();
			imgs[sq] = img;
		}
		tiles[sq].appendChild(img);
		board.makeMove(move);
	}

	setDragging(img, false);
	startSq = null;
});
