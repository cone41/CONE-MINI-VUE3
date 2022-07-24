import { extend } from '../shared/index';
class ReactiveEffect {
	private _fn: any;
	active: boolean = true;
	// 将 scheduler 声明为public，外部可使用
	public scheduler: Function | undefined;
	public onStop?: () => void;
	deps = [];

	constructor(fn, scheduler) {
		this._fn = fn;
		this.scheduler = scheduler;
	}
	//
	run() {
		activeEffect = this; //当前的 effect实例
		return this._fn();
	}
	stop() {
		// 多次调用 stop，只执行一次
		if (this.active) {
			if (this.onStop) {
				this.onStop();
			}
			cleanUpEffect(this);
			this.active = false;
		}
	}
}

function cleanUpEffect(effect) {
	effect.deps.forEach((dep: any) => {
		dep.delete(effect);
	});
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
	let dep = depsMap.get(key);
	if (!dep) {
		//一个 key 可能对应多个副作用函数，所以使用 set
		dep = new Set();
		depsMap.set(key, dep);
	}
	// 如果响应式数据的属性没有被 effect用到，则 activeEffect 为 undefined
	if (!activeEffect) return;
	dep.add(activeEffect);
	activeEffect.deps.push(dep);
}

// 触发依赖
export function trigger(target, key) {
	let depsMap = targetMap.get(target);
	let deps = depsMap.get(key);
	for (const effect of deps) {
		if (effect.scheduler) {
			effect.scheduler();
		} else {
			effect.run();
		}
	}
}

let activeEffect;
export function effect(fn, options: any = {}) {
	const _effect = new ReactiveEffect(fn, options.scheduler);
	extend(_effect, options);
	_effect.run();
	const runner: any = _effect.run.bind(_effect);
	runner.effect = _effect;
	return runner;
}

export function stop(runner) {
	runner.effect.stop();
}
