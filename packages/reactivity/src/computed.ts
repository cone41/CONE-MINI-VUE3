import { ReactiveEffect } from './effect';
class ComputedImpl {
	private _getter: any;
	private _dirty: boolean = true;
	private _value: any;
	private _effect: ReactiveEffect;
	constructor(getter) {
		this._effect = new ReactiveEffect(getter, () => {
			// 使用 scheduler 调度来处理
			if (!this._dirty) {
				this._dirty = true;
			}
		});
	}

	get value() {
		if (this._dirty) {
			this._dirty = false;
			// 缓存值
			this._value = this._effect.run();
		}
		// 值未改变直接返回缓存值
		return this._value;
	}
}

export function computed(getter) {
	return new ComputedImpl(getter);
}
