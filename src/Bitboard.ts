export class Bitboard {
	lower: number;
	upper: number;
	constructor(upper = 0, lower = 0) {
		// Force JS to treat numbers as 2^32 instead of 2^64
		this.upper = upper | 0;
		this.lower = lower | 0;
	}
	equals(bb: Bitboard) {
		return this.upper === bb.upper && this.lower === bb.lower;
	}
	isEmpty() {
		return !this.upper && !this.lower;
	}
	isUniversal() {
		return this.upper === universal && this.lower === universal;
	}
	// Leftshift
	lShift(shiftBy: number) {
		if (!shiftBy) return this;
		const wrappedBits =
			shiftBy < 32
				? this.upper >>> (32 - shiftBy)
				: this.upper << (shiftBy - 32);
		const upper = shiftBy < 32 ? this.upper << shiftBy : 0;
		const lower = (shiftBy < 32 ? this.lower << shiftBy : 0) | wrappedBits;
		return new Bitboard(upper, lower);
	}
	// Unsigned rightshift
	urShift(shiftBy: number) {
		if (!shiftBy) return this;
		const wrappedBits =
			shiftBy < 32
				? this.lower << (32 - shiftBy)
				: this.lower >>> (shiftBy - 32);
		const lower = shiftBy < 32 ? this.lower >>> shiftBy : 0;
		const upper = (shiftBy < 32 ? this.upper >>> shiftBy : 0) | wrappedBits;
		return new Bitboard(upper, lower);
	}
	// Signed rightshift
	srShift(shiftBy: number) {
		if (!shiftBy) return this;
		const sign = (1 << 31) & this.lower;
		const upperFill = shiftBy < 32 ? sign >> shiftBy : 0xffffffff;
		const lowerFill = shiftBy < 32 ? 0 : sign >> (shiftBy - 32);
		const shifted = this.urShift(shiftBy);
		shifted.lower |= upperFill;
		shifted.upper |= lowerFill;
		return shifted;
	}
	// Unsure if implementation is correct
	rotLeft(shiftBy: number) {
		if (!shiftBy) return this;
		const wrappedBits = this.lower >>> (32 - shiftBy);
		const shifted = this.lShift(shiftBy);
		shifted.upper |= wrappedBits;
		return shifted;
	}
	// Unsure if implementation is correct
	rotRight(shiftBy: number) {
		if (!shiftBy) return this;
		const wrappedBits = this.upper << (32 - shiftBy);
		const shifted = this.urShift(shiftBy);
		shifted.lower |= wrappedBits;
		return shifted;
	}
	and(...bbArr: Bitboard[]) {
		let upper = this.upper;
		let lower = this.lower;
		for (const bb of bbArr) {
			upper = upper & bb.upper;
			lower = lower & bb.lower;
		}
		return new Bitboard(upper, lower);
	}
	or(...bbArr: Bitboard[]) {
		let upper = this.upper;
		let lower = this.lower;
		for (const bb of bbArr) {
			upper = upper | bb.upper;
			lower = lower | bb.lower;
		}
		return new Bitboard(upper, lower);
	}
	xor(bb: Bitboard) {
		const upper = this.upper ^ bb.upper;
		const lower = this.lower ^ bb.lower;
		return new Bitboard(upper, lower);
	}
	not() {
		const upper = ~this.upper >>> 0;
		const lower = ~this.lower >>> 0;
		return new Bitboard(upper, lower);
	}
	popCnt() {
		return popCnt(this.upper) + popCnt(this.lower);
	}
	clone() {
		return new Bitboard(this.upper, this.lower);
	}
	toString() {
		return toBinaryString(this.lower) + toBinaryString(this.upper);
	}
	easyView() {
		const str = this.toString();
		let view = '';
		for (let i = 63; i >= 0; i--) {
			view += +str[i] ? '◼️' : '◻️';
			if (!(i % 8)) view += '\n';
		}
		console.log(view);
	}
	static Universal() {
		return new Bitboard(universal, universal);
	}
	static Mask(shiftBy: number) {
		return new Bitboard(1).lShift(shiftBy);
	}
}
export default Bitboard;

const universal = 0xffffffff | 0;
export function popCnt(x: number) {
	let cnt = 0;
	while (x) {
		x &= x - 1;
		cnt++;
	}
	return cnt;
}

export function toBinaryString(int: number) {
	let str = '';
	for (let i = 0; i < 32; i++) {
		const mask = 1 << i;
		const char = +Boolean(int & mask);
		str = `${char}${str}`;
	}
	return str;
}
