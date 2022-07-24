import { isReactive, reactive } from '../reactive';

describe('reactive', () => {
	it('reactive', () => {
		const obj = { sum: 10 };
		let proxyObj = reactive(obj);

		// 代理对象 不等于原始对象
		expect(proxyObj).not.toBe(obj);

		expect(proxyObj.sum).toBe(10);

		proxyObj.sum++;
		expect(proxyObj.sum).toBe(11);

		expect(isReactive(proxyObj)).toBe(true);
		expect(isReactive(obj)).toBe(false);
	});
});
