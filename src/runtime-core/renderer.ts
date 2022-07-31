import { isObject } from '../shared/index';
import { shapeFlags } from '../shared/shapeFlags';
import { createComponentInstance, setupComponent } from './component';
import { Fragment, Text } from './vnode';

export function render(vnode, container) {
	// patch
	patch(vnode, container, null);
}

function patch(vnode, container, parentComponent) {
	const { shapeFlag, type } = vnode;
	switch (type) {
		case Fragment:
			debugger;
			processFragment(vnode, container, parentComponent);
			break;
		case Text:
			debugger;
			processTextVNode(vnode, container);
			break;
		default:
			if (shapeFlag & shapeFlags.ELEMENT) {
				// 处理 element
				processElement(vnode, container, parentComponent);
			} else if (shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
				// 处理组件
				processComponent(vnode, container, parentComponent);
			}
	}
}

// 处理 fragment节点、直接 path children
function processFragment(vnode: any, container: any, parentComponent) {
	mountChildren(vnode.children, container, parentComponent);
}

// 文本节点，直接 createTextNode
function processTextVNode(vnode: any, container: any) {
	const { children } = vnode;
	console.log('children', children);
	const textVNode = (vnode.el = document.createTextNode(children));
	container.append(textVNode);
}

function processElement(vnode: any, container: any, parentComponent) {
	const { type, props, children, shapeFlag } = vnode;
	// 将 el 挂载到 vnode 上
	const el = (vnode.el = document.createElement(type));
	const isOn = (e) => /^on[A-Z]/.test(e);
	// 处理 props 属性
	for (const key in props) {
		if (isOn(key)) {
			const event = key.slice(2).toLowerCase();
			el.addEventListener(event, props[key]);
		} else {
			el.setAttribute(key, props[key]);
		}
	}

	if (shapeFlag & shapeFlags.TEXT_CHILDREN) {
		el.textContent = children;
	} else if (shapeFlag & shapeFlags.ARRAY_CHILDREN) {
		mountChildren(children, el, parentComponent);
	}
	container.append(el);
}

function mountChildren(children, container, parentComponent) {
	children.forEach((v) => {
		patch(v, container, parentComponent);
	});
}

function processComponent(vnode: any, container: any, parentComponent) {
	mountComponent(vnode, container, parentComponent);
}

function mountComponent(initialVNode: any, container: any, parentComponent) {
	// 创建组件实例
	const instance = createComponentInstance(initialVNode, parentComponent);
	setupComponent(instance);
	setupRenderEffect(instance, initialVNode, container);
}

function setupRenderEffect(instance: any, initialVNode, container) {
	const { proxy } = instance;
	const subTree = instance.render.call(proxy);
	patch(subTree, container, instance);

	// 如果是组件，则 vnode.el 就是render执行之后得到的 subtree
	initialVNode.el = subTree;
}
