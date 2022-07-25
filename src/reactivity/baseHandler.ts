import { isObject } from '../shared';
import { track, trigger } from './effect';
import { reactive, readonly } from './reactive';
import { extend } from '../shared/index';

export const enum ReactiveFlag {
	IS_READONLY = '__v_isReadonly',
	IS_REACTIVE = '__v_isReactive',
}

// 初始化调用一次即可
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

export function createGetter(isReadonly = false, isShallow = false) {
	return function get(target, key) {
		if (key === ReactiveFlag.IS_REACTIVE) {
			return !isReadonly;
		} else if (key === ReactiveFlag.IS_READONLY) {
			return isReadonly;
		}

		const ret = Reflect.get(target, key);

		if (isShallow) {
			return ret;
		}

		if (isObject(ret)) {
			return isReadonly ? readonly(ret) : reactive(ret);
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

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
	get: shallowReadonlyGet,
});
