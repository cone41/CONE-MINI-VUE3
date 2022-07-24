import { mutableHandlers, ReactiveFlag, readonlyHandlers } from './baseHandler';

export function reactive(raw) {
	return createReactiveObject(raw, mutableHandlers);
}

// 无需收集依赖
export function readonly(raw) {
	return createReactiveObject(raw, readonlyHandlers);
}

// 通过触发 get 传递特殊 key 值来判断
export function isReadonly(raw) {
	return !!raw[ReactiveFlag.IS_READONLY];
}

// 通过触发 get 传递特殊 key 值来判断
export function isReactive(raw) {
	return !!raw[ReactiveFlag.IS_REACTIVE];
}

function createReactiveObject(raw, baseHandler) {
	return new Proxy(raw, baseHandler);
}
