import { Tile } from './Board.js';
import { readFen } from './fen.js';

const tileSize = 70;
const root = document.querySelector(':root') as HTMLElement;
root.style.setProperty('--tile-size', `${tileSize}px`);

const startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const board = readFen(startFen);

const mouse: {
	x: number;
	y: number;
	boardIndex: number;
	isDown: boolean;
} = {
	x: 0,
	y: 0,
	boardIndex: 0,
	isDown: false,
};
board.elem.addEventListener('mousedown', (e) => {
	mouse.isDown = true;
});
board.elem.addEventListener('mouseup', () => {
	mouse.isDown = false;
});
board.elem.addEventListener('mousemove', (e) => {
	mouse.x = e.pageX;
	mouse.y = e.pageY;
	mouse.boardIndex =
		Math.floor(e.pageX / tileSize) + Math.floor(e.pageY / tileSize) * 8;
});

function setXYOnElement(element: HTMLElement, x: number, y: number) {
	element.style.setProperty('--x', `${x}px`);
	element.style.setProperty('--y', `${y}px`);
}

let currentTile: Tile | null = null;
function loop() {
	const hoveredTile = board.tiles[mouse.boardIndex];

	if (currentTile) board.elem.style.setProperty('cursor', 'grabbing');
	else if (hoveredTile.piece)
		board.elem.style.setProperty('cursor', 'pointer');
	else board.elem.style.removeProperty('cursor');

	if (mouse.isDown) {
		if (currentTile) {
			setXYOnElement(currentTile.piece!.img, mouse.x, mouse.y);
		} else if (hoveredTile.piece) {
			currentTile = hoveredTile;
			currentTile.piece!.setDragging(true);
			setXYOnElement(currentTile.piece!.img, mouse.x, mouse.y);
		}
	} else if (currentTile) {
		const curPiece = currentTile.piece!;
		if (!hoveredTile.piece || hoveredTile.piece.color !== curPiece.color) {
			currentTile.remove();
			hoveredTile.remove();
			hoveredTile.add(curPiece);
		}

		curPiece.setDragging(false);
		currentTile = null;
	}
	requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
