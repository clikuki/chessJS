export class Bitboard {
	upper: number;
	lower: number;
	constructor(lower = 0, upper = 0) {
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
				? this.lower >>> (32 - shiftBy)
				: this.lower << (shiftBy - 32);
		const lower = shiftBy < 32 ? this.lower << shiftBy : 0;
		let upper = shiftBy < 64 ? this.upper << shiftBy : 0;
		upper |= wrappedBits;
		return new Bitboard(lower, upper);
	}
	// Unsigned rightshift
	urShift(shiftBy: number) {
		if (!shiftBy) return this;
		const wrappedBits =
			shiftBy < 32
				? this.upper << (32 - shiftBy)
				: this.upper >>> (shiftBy - 32);
		const upper = shiftBy < 32 ? this.upper >>> shiftBy : 0;
		let lower = shiftBy < 64 ? this.lower >>> shiftBy : 0;
		lower |= wrappedBits;
		return new Bitboard(lower, upper);
	}
	// Signed rightshift
	srShift(shiftBy: number) {
		if (!shiftBy) return this;
		const sign = (1 << 31) & this.upper;
		const upperFill = shiftBy < 32 ? sign >> shiftBy : 0xffffffff;
		const lowerFill = shiftBy < 32 ? 0 : sign >> (shiftBy - 32);
		const shifted = this.urShift(shiftBy);
		shifted.upper |= upperFill;
		shifted.lower |= lowerFill;
		return shifted;
	}
	rotLeft(shiftBy: number) {
		if (!shiftBy) return this;
		const wrappedBits = this.upper >>> (32 - shiftBy);
		const shifted = this.lShift(shiftBy);
		shifted.lower |= wrappedBits;
		return shifted;
	}
	rotRight(shiftBy: number) {
		if (!shiftBy) return this;
		const wrappedBits = this.lower << (32 - shiftBy);
		const shifted = this.urShift(shiftBy);
		shifted.upper |= wrappedBits;
		return shifted;
	}
	and(...bbArr: Bitboard[]) {
		let upper = this.upper;
		let lower = this.lower;
		for (const bb of bbArr) {
			upper = upper & bb.upper;
			lower = lower & bb.lower;
		}
		return new Bitboard(lower, upper);
	}
	or(...bbArr: Bitboard[]) {
		let upper = this.upper;
		let lower = this.lower;
		for (const bb of bbArr) {
			upper = upper | bb.upper;
			lower = lower | bb.lower;
		}
		return new Bitboard(lower, upper);
	}
	xor(bb: Bitboard) {
		const upper = this.upper ^ bb.upper;
		const lower = this.lower ^ bb.lower;
		return new Bitboard(lower, upper);
	}
	not() {
		const upper = ~this.upper >>> 0;
		const lower = ~this.lower >>> 0;
		return new Bitboard(lower, upper);
	}
	popCnt() {
		return popCnt(this.upper) + popCnt(this.lower);
	}
	clone() {
		return new Bitboard(this.lower, this.upper);
	}
	toString(separator?: boolean) {
		let str = '';
		for (const int of [this.lower, this.upper]) {
			for (let i = 0; i < 32; i++) {
				const mask = 1 << i;
				const char = +Boolean(int & mask);
				str = `${char}${str}`;
			}
			str = `${separator ? ' ' : ''}${str}`;
		}
		return str.trimStart();
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
export const popCnt = (x: number) => {
	let cnt = 0;
	while (x) {
		x &= x - 1;
		cnt++;
	}
	return cnt;
};
