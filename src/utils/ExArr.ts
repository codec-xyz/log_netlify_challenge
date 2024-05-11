export class ExArr<T> extends Array<T> {
	static use<T>(arr: T[]): ExArr<T> {
		return ExArr.from(arr) as ExArr<T>;
	} 

	static createMap<T>(count: number, fn: (i: number) => T): ExArr<T> {
		return new ExArr(count).fill(undefined).map((_, i) => fn(i)) as ExArr<T>;
	}

	mapInBetween<U>(fn: (a: T, b: T) => U): ExArr<U> {
		return (new ExArr(this.length - 1)).fill(undefined).map((_, i) => fn(this[i] as T, this[i + 1] as T)) as ExArr<U>;
	}

	group(fn: (a: T) => string | number | undefined): { [key: string | number]: ExArr<T> } {
		const obj: { [key: string | number]: ExArr<T> } = {};
		this.forEach(i => {
			const result = fn(i);
			if(result === undefined) return;
			if(obj[result] === undefined) obj[result] = new ExArr();
			obj[result]?.push(i);
		});
		return obj;
	}

	makeLookup(fn: (a: T) => string): { [key: string]: T } {
		const lookup: { [key: string]: T } = {};
		this.forEach(a => lookup[fn(a)] = a);
		return lookup;
	}

	makeLookupMap<U>(fn: (a: T) => [ string, U ]): { [key: string]: U } {
		const lookup: { [key: string]: U } = {};
		this.forEach(a => {
			const map = fn(a);
			lookup[map[0]] = map[1];
		});
		return lookup;
	}
}

export function mapMap<T, U, V, W>(map: Map<T, U>, fn: (key: T, val: U) => [V, W]): Map<V, W> {
	return new Map(Array.from(map, a => fn(a[0], a[1])));
}