import { reactive, readonly } from '../reactive';

describe('reactive', () => {
	it('reactive', () => {
		const obj = { sum: 10 };
		let proxyObj = reactive(obj);

		// 代理对象 不等于原始对象
		expect(proxyObj).not.toBe(obj);

		expect(proxyObj.sum).toBe(10);

		proxyObj.sum++;
		expect(proxyObj.sum).toBe(11);
	});

	it('readonly', () => {
		let obj = { name: 'cone', age: { base: 18 } };
		let readonlyObj = readonly(obj);
		// 原始对象不等于代理对象
		expect(obj).not.toBe(readonlyObj);

		readonlyObj.name = 'cc';
		expect(obj.name).toBe('cone');
	});

	it('readonly can not be set', () => {
		let obj = { name: 'cone', age: { base: 18 } };
		let readonlyObj = readonly(obj);
		console.warn = jest.fn();
		readonlyObj.name = 'cc';
		expect(console.warn).toBeCalled();
	});
});
