import { isObject } from '@cone-mini-vue/shared';
import { mutableHandlers, ReactiveFlag, readonlyHandlers, shallowReadonlyHandlers } from './baseHandler';

export function reactive(raw) {
	return createReactiveObject(raw, mutableHandlers);
}

export function shallowReactive(raw) {
	return createReactiveObject(raw, mutableHandlers);
}

// 无需收集依赖
export function readonly(raw) {
	return createReactiveObject(raw, readonlyHandlers);
}

export function shallowReadonly(raw) {
	return createReactiveObject(raw, shallowReadonlyHandlers);
}

// 通过触发 get 传递特殊 key 值来判断
export function isReadonly(raw) {
	return !!raw[ReactiveFlag.IS_READONLY];
}

// 通过触发 get 传递特殊 key 值来判断
export function isReactive(raw) {
	return !!raw[ReactiveFlag.IS_REACTIVE];
}

export function isProxy(value) {
	return isReactive(value) || isReadonly(value);
}

function createReactiveObject(target, baseHandler) {
	if (!isObject(target)) {
		console.warn(`target must be an Object`, target);
		return target;
	}
	return new Proxy(target, baseHandler);
}
