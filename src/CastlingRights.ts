export class CastlingRights {
	// black queen, black king, white queen, white king
	rights = [false, false, false, false];
	can(color: 0 | 1, side: 0 | 1) {
		return this.rights[color * 2 + side];
	}
	canColor(color: 0 | 1) {
		return [this.rights[color * 2], this.rights[color * 2 + 1]];
	}
	set(color: 0 | 1, side: 0 | 1, right: boolean) {
		this.rights[color * 2 + side] = right;
	}
	setColor(color: 0 | 1, right: boolean) {
		this.rights[color * 2 + 0] = right;
		this.rights[color * 2 + 1] = right;
	}
}
