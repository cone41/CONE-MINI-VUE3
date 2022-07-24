class ReactiveEffect {
	private _fn: any;
	constructor(fn) {
		this._fn = fn;
	}
	//
	run() {
		activeEffect = this; //当前的 effect实例
		return this._fn();
	}
}

// 收集依赖
let targetMap = new Map();
export function track(target, key) {
	// 外层的响应式对象
	let depsMap = targetMap.get(target);
	if (!depsMap) {
		depsMap = new Map();
		targetMap.set(target, depsMap);
	}
	let deps = depsMap.get(key);
	if (!deps) {
		deps = new Set(); //一个 key 可能对应多个副作用函数，所以使用 set
		depsMap.set(key, deps);
	}
	activeEffect && deps.add(activeEffect);
}

// 触发依赖
export function trigger(target, key) {
	let depsMap = targetMap.get(target);
	let deps = depsMap.get(key);
	for (const effect of deps) {
		effect.run();
	}
}

let activeEffect;
export function effect(fn) {
	const _effect = new ReactiveEffect(fn);
	_effect.run();
	return _effect.run.bind(_effect);
}
