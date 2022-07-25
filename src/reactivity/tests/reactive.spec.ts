import { isProxy, isReactive, reactive } from '../reactive';

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
		expect(isProxy(proxyObj)).toBe(true);
	});

	it('reactive nest should be reactive', () => {
		const obj = {
			name: 'cone',
			nest: {
				age: [{ foo: 18 }],
			},
		};
		const proxyObj = reactive(obj);

		expect(isReactive(proxyObj.nest)).toBe(true);
		expect(isReactive(proxyObj.nest.age)).toBe(true);
		expect(isReactive(proxyObj.nest.age[0])).toBe(true);
	});
});
