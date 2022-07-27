import { isRef, ref, unRef } from '../ref';
import { effect } from '../effect';

describe('ref', () => {
	it('happy path', () => {
		const age = ref(10);
		expect(age.value).toBe(10);
		age.value++;
		expect(age.value).toBe(11);
	});

	it('should be reactive', () => {
		const a = ref(1);
		let dummy;
		let callTime = 0;
		effect(() => {
			callTime++;
			dummy = a.value;
		});

		expect(dummy).toBe(1);
		expect(callTime).toBe(1);
		a.value++;
		expect(dummy).toBe(2);
		expect(callTime).toBe(2);
		a.value = 2;
		expect(callTime).toBe(2);
	});

	it('should be Reactive when ref is an Object', () => {
		let foo = ref({ bar: 1 });
		let dummy;
		let callTime = 0;
		effect(() => {
			callTime++;
			dummy = foo.value.bar;
		});
		expect(dummy).toBe(1);
		expect(callTime).toBe(1);

		foo.value.bar = 2;
		expect(dummy).toBe(2);
		expect(callTime).toBe(2);

		foo.value.bar = 2;
		// expect(callTime).toBe(2);
	});

	it('isRef', () => {
		const a = ref(1);
		expect(isRef(a)).toBe(true);
		expect(isRef(1)).toBe(false);
	});

	it('unRef', () => {
		const a = ref(1);
		expect(unRef(a)).toBe(1);
		expect(unRef(1)).toBe(1);
	});
});
