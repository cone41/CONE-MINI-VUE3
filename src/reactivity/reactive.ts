import { mutableHandlers, readonlyHandlers } from './baseHandler';

export function reactive(raw) {
	return createActiveObject(raw, mutableHandlers);
}

// 无需收集依赖
export function readonly(raw) {
	return createActiveObject(raw, readonlyHandlers);
}

function createActiveObject(raw, baseHandler) {
	return new Proxy(raw, baseHandler);
}
