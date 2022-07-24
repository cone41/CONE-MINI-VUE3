import { track, trigger } from './effect';

// 初始化调用一次即可
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);

export function createGetter(isReadonly = false) {
	return function get(target, key) {
		const ret = Reflect.get(target, key);
		// 收集依赖
		if (!isReadonly) {
			track(target, key);
		}
		return ret;
	};
}

export function createSetter() {
	return function get(target, key, value) {
		const ret = Reflect.set(target, key, value);
		// 触发依赖
		trigger(target, key);
		return ret;
	};
}

export const mutableHandlers = {
	get,
	set,
};

export const readonlyHandlers = {
	get: readonlyGet,
	set(target, key, value) {
		// set 时不可修改
		console.warn(`key:${key} can not be set, because target is readonly`, target);
		return true;
	},
};
