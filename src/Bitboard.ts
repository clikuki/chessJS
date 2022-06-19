export class BB {
	upper: number;
	lower: number;
	constructor(lower = 0, upper = 0) {
		// Force JS to turn floats in integers
		this.upper = upper | 0;
		this.lower = lower | 0;
	}
	equals(bb: BB) {
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
		return new BB(lower, upper);
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
		return new BB(lower, upper);
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
	and(bb: BB) {
		const upper = this.upper & bb.upper;
		const lower = this.lower & bb.lower;
		return new BB(lower, upper);
	}
	or(bb: BB) {
		const upper = this.upper | bb.upper;
		const lower = this.lower | bb.lower;
		return new BB(lower, upper);
	}
	xor(bb: BB) {
		const upper = this.upper ^ bb.upper;
		const lower = this.lower ^ bb.lower;
		return new BB(lower, upper);
	}
	not() {
		const upper = ~this.upper >>> 0;
		const lower = ~this.lower >>> 0;
		return new BB(lower, upper);
	}
	popCnt() {
		return popCnt(this.upper) + popCnt(this.lower);
	}
	copy() {
		return new BB(this.lower, this.upper);
	}
	toString() {
		let str = '';
		for (const int of [this.lower, this.upper]) {
			for (let i = 0; i < 32; i++) {
				const mask = 1 << i;
				const char = +!!(int & mask);
				str = `${char}${str}`;
			}
			str = ` ${str}`;
		}
		return str.trimStart();
	}
	static Universal() {
		return new BB(universal, universal);
	}
}
export default BB;

const universal = 0xffffffff | 0;
export const popCnt = (x: number) => {
	let cnt = 0;
	while (x) {
		x &= x - 1;
		cnt++;
	}
	return cnt;
};
