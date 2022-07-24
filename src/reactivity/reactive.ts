import { track, trigger } from './effect';
function reactive(raw) {
	return new Proxy(raw, {
		get(target, key) {
			const ret = Reflect.get(target, key);
			// 收集依赖
			track(target, key);
			return ret;
		},
		set(target, key, value) {
			const ret = Reflect.set(target, key, value);
			// 触发依赖
			trigger(target, key);
			return ret;
		},
	});
}

export default reactive;
