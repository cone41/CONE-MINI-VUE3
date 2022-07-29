import { isObject } from '../shared/index';
import { shapeFlags } from '../shared/shapeFlags';
import { createComponentInstance, setupComponent } from './component';

export function render(vnode, container) {
	// patch
	patch(vnode, container);
}

function patch(vnode, container) {
	console.log('---vnode----', vnode);
	const { shapeFlag } = vnode;
	if (shapeFlag & shapeFlags.ELEMENT) {
		// 处理 element
		processElement(vnode, container);
	} else if (shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
		// 处理组件
		processComponent(vnode, container);
	}
}

function processElement(vnode: any, container: any) {
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
		mountChildren(children, el);
	}
	container.append(el);
}

function mountChildren(children, container) {
	children.forEach((v) => {
		patch(v, container);
	});
}

function processComponent(vnode: any, container: any) {
	mountComponent(vnode, container);
}

function mountComponent(initialVNode: any, container: any) {
	// 创建组件实例
	const instance = createComponentInstance(initialVNode);
	setupComponent(instance);
	setupRenderEffect(instance, initialVNode, container);
}

function setupRenderEffect(instance: any, initialVNode, container) {
	const { proxy } = instance;
	const subTree = instance.render.call(proxy);
	patch(subTree, container);

	// 如果是组件，则 vnode.el 就是render执行之后得到的 subtree
	initialVNode.el = subTree;
}
