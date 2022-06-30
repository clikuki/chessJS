import { readFen } from './fen.js';
import { ImageSrcContainer, imgSrcs } from './loadImages.js';
import { getPieceCharClr } from './utility.js';

function getMouseEventXY(e: MouseEvent) {
	return {
		x: e.pageX,
		y: e.pageY,
	};
}

function sqToPos(sq: number) {
	return [(sq % 8) * tileSize, Math.floor(sq / 8) * tileSize] as const;
}

function setXYOnElement(element: HTMLElement, x: number, y: number) {
	element.style.setProperty('--x', `${x}px`);
	element.style.setProperty('--y', `${y}px`);
}

function setTileXYOnElement(element: HTMLElement, x: number, y: number) {
	element.setAttribute('data-tile-x', `${x}`);
	element.setAttribute('data-tile-y', `${y}`);
}

function getElementTileXY(element: HTMLElement) {
	const x = element.getAttribute('data-tile-x');
	const y = element.getAttribute('data-tile-y');
	return {
		x: x === null ? null : +x,
		y: y === null ? null : +y,
	};
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

function updateTileHighlights(from: number, to: number) {
	const className = 'highlight';
	tiles.forEach((tile, i) => {
		if ([from, to].includes(i)) tile.classList.add(className);
		else tile.classList.remove(className);
	});
}

// Get tile size
const computedStyles = getComputedStyle(document.documentElement);
const tileSizeInRem = parseFloat(
	computedStyles.getPropertyValue('--tile-size'),
);
const fontSize = parseFloat(computedStyles.fontSize);
const tileSize = tileSizeInRem * fontSize;

// Load up board
const startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const board = readFen(startFen);
board.generateMoves();

// Create dom representation
const grid = document.createElement('div');
const imgs: (HTMLImageElement | null)[] = [];
const tiles: HTMLElement[] = [];
grid.classList.add('board');
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
			img.classList.add('piece');
			imgs[index] = img;
			setXYOnElement(img, i * tileSize, j * tileSize);
			setTileXYOnElement(img, i * tileSize, j * tileSize);
			grid.appendChild(img);
		} else imgs[index] = null;

		tiles[index] = tile;
		grid.appendChild(tile);
	}
}
document.body.appendChild(grid);

let startSq: number | null = null;
grid.addEventListener('mousedown', (e) => {
	e.stopPropagation();
	const { x, y } = getMouseEventXY(e);
	const sq = getSq(x, y);
	const piece = board.pieces[sq];
	if (!piece || getPieceCharClr(piece) !== board.activeClr) return;
	const img = imgs[sq]!;
	setXYOnElement(img, x, y);
	setDragging(img, true);
	startSq = sq;
});
grid.addEventListener('mousemove', (e) => {
	if (startSq === null) return;
	const { x, y } = getMouseEventXY(e);
	const img = imgs[startSq]!;
	setXYOnElement(img, x, y);
});
grid.addEventListener('mouseup', (e) => {
	if (startSq === null) return;
	const img = imgs[startSq]!;
	const { x, y } = getMouseEventXY(e);
	const sq = getSq(x, y);
	const move = findMove(startSq, sq);
	if (move && canTakeSq(startSq, sq)) {
		imgs[startSq] = null;
		if (board.enpassantSq === sq) {
			const captureSq = sq + (board.activeClr ? 8 : -8);
			imgs[captureSq]?.remove();
			imgs[captureSq] = null;
		}
		imgs[sq]?.remove();
		imgs[sq] = img;
		setTileXYOnElement(img, ...sqToPos(sq));
		if (move.options.isCastling) {
			const side = move.options.castlingSide!;
			const oldRookPosition = move.targetSq + (side ? 1 : -2);
			const newRookPosition = move.targetSq + (side ? -1 : 1);
			const rookImg = imgs[oldRookPosition]!;
			imgs[oldRookPosition] = null;
			imgs[newRookPosition] = rookImg;
			const [x, y] = sqToPos(newRookPosition);
			setXYOnElement(rookImg, x, y);
			setTileXYOnElement(rookImg, x, y);
		}
		board.makeMove(move);
		updateTileHighlights(move.startSq, move.targetSq);
	}

	const { x: tileX, y: tileY } = getElementTileXY(img);
	setXYOnElement(img, tileX!, tileY!);
	setDragging(img, false);
	startSq = null;
});
