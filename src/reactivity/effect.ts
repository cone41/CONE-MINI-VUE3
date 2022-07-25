import { extend } from '../shared/index';

let activeEffect;
let shouldTrack;
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
		// 调用 stop 之后不走依赖收集的逻辑
		if (!this.active) {
			return this._fn();
		}

		// 逻辑走到这里表示应该要收集依赖
		shouldTrack = true;
		//当前的 effect实例
		activeEffect = this;

		const ret = this._fn();
		//reset flag
		shouldTrack = false;

		return ret;
	}
	stop() {
		// 多次调用 stop，只执行一次
		if (this.active) {
			cleanUpEffect(this);
			if (this.onStop) {
				this.onStop();
			}
			this.active = false;
		}
	}
}

function cleanUpEffect(effect) {
	effect.deps.forEach((dep: any) => {
		dep.delete(effect);
	});
	effect.deps.length = 0;
}

// 收集依赖
let targetMap = new Map();
export function track(target, key) {
	if (!isTracking()) return;
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

	if (dep.has(activeEffect)) return;
	dep.add(activeEffect);
	activeEffect.deps.push(dep);
}

// 是否需要收集依赖
// 如果响应式数据的属性没有被 effect用到，则 activeEffect 为 undefined
function isTracking() {
	return shouldTrack && activeEffect !== undefined;
}

// 触发依赖
export function trigger(target, key) {
	let depsMap = targetMap.get(target);
	if (!depsMap) return;
	let deps = depsMap.get(key);
	for (const effect of deps) {
		if (effect.scheduler) {
			effect.scheduler();
		} else {
			effect.run();
		}
	}
}

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
