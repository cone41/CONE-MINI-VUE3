// 抽离平台特定代码
import { createRenderer } from '../runtime-core';
function createElement(type) {
	return document.createElement(type);
}
function patchProps(el, key, prevVal, nextVal) {
	const isOn = (e) => /^on[A-Z]/.test(e);
	if (isOn(key)) {
		const event = key.slice(2).toLowerCase();
		el.addEventListener(event, nextVal);
	} else {
		if (nextVal === undefined || nextVal === null) {
			el.removeAttribute(key, nextVal);
		} else {
			el.setAttribute(key, nextVal);
		}
	}
}
function insert(el, parent) {
	parent.append(el);
}

function remove(el) {
	const parentNode = el.parentNode;
	parentNode.removeChild(el);
}

function setElementText(el, text) {
	el.textContent = text;
}

const renderer: any = createRenderer({
	createElement,
	patchProps,
	insert,
	remove,
	setElementText,
});

export function createApp(...args) {
	return renderer.createApp(...args);
}

export * from '../runtime-core';
