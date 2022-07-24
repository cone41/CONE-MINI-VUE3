import { track, trigger } from './effect';

export const enum ReactiveFlag {
	IS_READONLY = '__v_isReadonly',
	IS_REACTIVE = '__v_isReactive',
}

// 初始化调用一次即可
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);

export function createGetter(isReadonly = false) {
	return function get(target, key) {
		const ret = Reflect.get(target, key);

		if (key === ReactiveFlag.IS_REACTIVE) {
			return !isReadonly;
		} else if (key === ReactiveFlag.IS_READONLY) {
			return isReadonly;
		}
		if (!isReadonly) {
			// 收集依赖
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
