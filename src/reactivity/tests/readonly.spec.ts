import { readonly, isReadonly, reactive } from '../reactive';

describe('readonly', () => {
	it('readonly', () => {
		let obj = { name: 'cone', age: { base: 18 } };
		let readonlyObj = readonly(obj);
		// 原始对象不等于代理对象
		expect(obj).not.toBe(readonlyObj);

		readonlyObj.name = 'cc';
		expect(obj.name).toBe('cone');

		expect(isReadonly(readonlyObj)).toBe(true);
		expect(isReadonly(obj)).toBe(false);

		const foo = reactive({ name: 'foo' });
		expect(isReadonly(foo)).toBe(false);
	});

	it('readonly can not be set', () => {
		let obj = { name: 'cone', age: { base: 18 } };
		let readonlyObj = readonly(obj);
		console.warn = jest.fn();
		readonlyObj.name = 'cc';
		expect(console.warn).toBeCalled();
	});
});
