import { hasChanged, isObject } from '../shared';
import { isTracking, trackEffects, triggerEffects } from './effect';
import { reactive } from './reactive';

class RefImpl {
	private _value: any;
	private _dep: Set<unknown>;
	private _rawVal: any;
	public __v_isRef = true;
	constructor(value) {
		// 记录原始对象用于 set 时比较
		this._rawVal = value;
		this._dep = new Set();
		this._value = convert(value);
	}
	get value() {
		if (isTracking()) {
			trackEffects(this._dep);
		}
		return this._value;
	}
	set value(newVal) {
		// 如果value 没有改变则不需要更新
		if (hasChanged(newVal, this._rawVal)) {
			this._rawVal = newVal;
			this._value = convert(newVal);
			triggerEffects(this._dep);
		}
	}
}

function convert(value) {
	return isObject(value) ? reactive(value) : value;
}

export function ref(val) {
	return new RefImpl(val);
}

export function isRef(ref) {
	return !!ref.__v_isRef;
}

export function unRef(ref) {
	return isRef(ref) ? ref.value : ref;
}

export function proxyRefs(objectWithRefs) {
	return new Proxy(objectWithRefs, {
		get(target, key) {
			// 如果是 ref，则返回.value
			return unRef(Reflect.get(target, key));
		},
		set(target, key, value) {
			if (isRef(target[key]) && !isRef(value)) {
				return (target[key].value = value);
			} else {
				return Reflect.set(target, key, value);
			}
		},
	});
}
