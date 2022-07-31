// 导出 provide 、inject 函数

import { getCurrentInstance } from './component';

export function provide(key, value) {
	// 获取当前组件实例
	const currentInstance: any = getCurrentInstance();
	if (currentInstance) {
		let { provides } = currentInstance;
		const parentProvides = currentInstance.parent.provides;

		// 第一次调用 provide
		if (provides === parentProvides) {
			// Object.create 将 parentProvides 指向 provide 的原型
			provides = currentInstance.provides = Object.create(parentProvides);
		}

		provides[key] = value;
	}
}

export function inject(key, defaultVal) {
	const currentInstance: any = getCurrentInstance();
	if (currentInstance) {
		const parentProvides = currentInstance.parent.provides;
		if (key in parentProvides) {
			return parentProvides[key];
		} else if (defaultVal) {
			return typeof defaultVal === 'function' ? defaultVal() : defaultVal;
		}
	}
}
