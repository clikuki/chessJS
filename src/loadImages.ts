export interface ImageSrcContainer {
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
function loadImages() {
	const imgSrcs = {} as ImageSrcContainer;
	const imgContainer = document.createElement('div');
	imgContainer.classList.add('imagePreloading');
	const extension = 'png';
	const basePath = 'assets/';
	const pieceChars = 'kqrbnp'.split('');
	const clrChars = ['d', 'l'];
	for (const pieceChar of pieceChars) {
		for (const clrChar of clrChars) {
			const name = `${pieceChar}${clrChar}` as keyof ImageSrcContainer;
			const imgSrc = `${basePath}${name}.${extension}`;
			const image = document.createElement('img') as HTMLImageElement;
			image.src = imgSrc;
			imgContainer.appendChild(image);
			imgSrcs[name] = imgSrc;
		}
	}
	document.body.appendChild(imgContainer);
	return imgSrcs;
}
export const imgSrcs = loadImages();
