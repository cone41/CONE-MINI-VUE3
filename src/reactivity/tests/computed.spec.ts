import { computed } from '../computed';
import { reactive } from '../reactive';

describe('computed', () => {
	it('happy path', () => {
		const user = reactive({
			foo: 10,
		});

		const foo = computed(() => {
			return user.foo;
		});

		expect(foo.value).toBe(10);
	});

	it('lazy computed', () => {
		const user = reactive({
			foo: 10,
		});
		const getter = jest.fn(() => {
			return user.foo;
		});
		const foo = computed(getter);

		expect(getter).not.toHaveBeenCalled();

		expect(foo.value).toBe(10);
		expect(getter).toHaveBeenCalledTimes(1);

		// 值未改变，getter 不触发
		foo.value;
		expect(getter).toHaveBeenCalledTimes(1);

		// 惰性加载，没访问getter就不执行
		user.foo = 20;
		expect(getter).toHaveBeenCalledTimes(1);

		// 访问了 computed 的值才执行 getter
		expect(foo.value).toBe(20);
		expect(getter).toHaveBeenCalledTimes(2);

		foo.value;
		expect(getter).toHaveBeenCalledTimes(2);
	});
});
