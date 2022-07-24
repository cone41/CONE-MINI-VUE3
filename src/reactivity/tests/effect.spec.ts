import reactive from '../reactive';
import { effect } from '../effect';
describe('effect', () => {
	it('happy path', () => {
		let proxyObj = reactive({
			sum: 10,
		});
		let nextVal = null;

		effect(() => {
			nextVal = proxyObj.sum + 1;
		});

		expect(nextVal).toBe(11);

		proxyObj.sum++;

		expect(nextVal).toBe(12);
	});

	it('should return runner when call effect', () => {
		let foo = 10;
		let runner = effect(() => {
			foo++;
			return 'foo';
		});
		expect(foo).toBe(11);
		let ret = runner();
		expect(foo).toBe(12);
		expect(ret).toBe('foo');
	});
});
