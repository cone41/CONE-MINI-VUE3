import { reactive } from '../src/reactive';
import { effect, stop } from '../src/effect';
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

	// scheduler调度
	it('scheduler', () => {
		let dummy;
		let run: any;
		const scheduler = jest.fn(() => {
			run = runner;
		});
		const obj = reactive({ sum: 10 });
		const runner = effect(
			() => {
				dummy = obj.sum;
			},
			{ scheduler }
		);

		expect(scheduler).not.toHaveBeenCalled();
		expect(dummy).toBe(10);

		// trigger
		obj.sum++;
		// trigger时，scheduler被调用
		expect(scheduler).toHaveBeenCalledTimes(1);
		// effect fn此时不会执行，dummy 的值仍然是 10
		expect(dummy).toBe(10);
		// 执行scheduler 的 run，也就是 effect fn
		run();
		// fn 执行
		expect(dummy).toBe(11);
	});

	it('stop', () => {
		let dummy;
		const obj = reactive({ sum: 10 });
		const runner = effect(() => {
			dummy = obj.sum;
		});
		obj.sum = 11;
		expect(dummy).toBe(11);
		stop(runner);
		// obj.sum = 12;

		// 等价于 obj.sum = obj.sum + 1;
		obj.sum++;
		expect(dummy).toBe(11);

		runner();
		expect(dummy).toBe(12);
	});

	it('onStop', () => {
		// 调用stop 时，onStop 传入的函数会被执行
		let dummy;
		let obj = reactive({ sum: 10 });
		const onStop = jest.fn();
		const runner = effect(
			() => {
				dummy = obj.sum;
			},
			{
				onStop,
			}
		);
		expect(onStop).not.toHaveBeenCalled();
		stop(runner);
		expect(onStop).toHaveBeenCalledTimes(1);
	});
});
