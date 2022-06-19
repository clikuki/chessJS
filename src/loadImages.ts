export interface ImagesContainer {
	kl: string;
	kd: string;
	ql: string;
	qd: string;
	rl: string;
	rd: string;
	bl: string;
	bd: string;
	nl: string;
	nd: string;
	pl: string;
	pd: string;
}
const images = {} as ImagesContainer;
let hasBeenLoaded = false;
export function loadImages() {
	if (hasBeenLoaded) return images;
	const imgContainer = document.createElement('div');
	imgContainer.classList.add('imagePreloading');
	const extension = 'png';
	const basePath = 'assets/';
	const pieceChars = 'kqrbnp'.split('');
	const clrChars = ['d', 'l'];
	for (const pieceChar of pieceChars) {
		for (const clrChar of clrChars) {
			const name = `${pieceChar}${clrChar}` as keyof ImagesContainer;
			const imgSrc = `${basePath}${name}.${extension}`;
			const image = document.createElement('img') as HTMLImageElement;
			image.src = imgSrc;
			imgContainer.appendChild(image);
			images[name] = imgSrc;
		}
	}
	document.body.appendChild(imgContainer);
	hasBeenLoaded = true;
	return images;
}
