// 抽离平台特定代码
import { createRenderer } from '../runtime-core';
function createElement(type) {
	return document.createElement(type);
}
function patchProps(el, key, val) {
	const isOn = (e) => /^on[A-Z]/.test(e);
	if (isOn(key)) {
		const event = key.slice(2).toLowerCase();
		el.addEventListener(event, val);
	} else {
		el.setAttribute(key, val);
	}
}
function insert(el, parent) {
	parent.append(el);
}

const renderer: any = createRenderer({
	createElement,
	patchProps,
	insert,
});

export function createApp(...args) {
	return renderer.createApp(...args);
}

export * from '../runtime-core';
