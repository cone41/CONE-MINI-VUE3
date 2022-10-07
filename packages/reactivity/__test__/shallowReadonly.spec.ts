import { isReadonly, shallowReadonly } from '../src/reactive';

describe('shallowReadonly', () => {
	test('just shallow', () => {
		const obj = shallowReadonly({ foo: { bar: 1 } });
		expect(isReadonly(obj)).toBe(true);
		expect(isReadonly(obj.foo)).toBe(false);
	});

	it('readonly can not be set', () => {
		let obj = { name: 'cone', age: { base: 18 } };
		let readonlyObj = shallowReadonly(obj);
		console.warn = jest.fn();
		readonlyObj.name = 'cc';
		expect(console.warn).toBeCalled();
	});
});
