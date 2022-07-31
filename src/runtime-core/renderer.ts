import { isObject } from '../shared/index';
import { shapeFlags } from '../shared/shapeFlags';
import { createComponentInstance, setupComponent } from './component';
import { Fragment, Text } from './vnode';
import { createAppAPI } from './createApp';
import { effect } from '../reactivity/effect';

export function createRenderer(options) {
	const { createElement: hostCreateElement, patchProps: hostPatchProps, insert: hostInsert } = options;
	function render(vnode, container) {
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

	function processElement(vnode: any, container: any, parentComponent) {
		mountElement(vnode, container, parentComponent);
	}

	// 文本节点，直接 createTextNode
	function processTextVNode(vnode: any, container: any) {
		const { children } = vnode;
		const textVNode = (vnode.el = document.createTextNode(children));
		container.append(textVNode);
	}

	function mountElement(vnode: any, container: any, parentComponent) {
		const { type, props, children, shapeFlag } = vnode;
		// 将 el 挂载到 vnode 上
		const el = (vnode.el = hostCreateElement(type));

		for (const key in props) {
			const val = props[key];
			hostPatchProps(el, key, val);
		}

		if (shapeFlag & shapeFlags.TEXT_CHILDREN) {
			el.textContent = children;
		} else if (shapeFlag & shapeFlags.ARRAY_CHILDREN) {
			mountChildren(children, el, parentComponent);
		}
		hostInsert(el, container);
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
		effect(() => {
			if (!instance.isMounted) {
				console.log('init');
				const { proxy } = instance;
				const subTree = instance.render.call(proxy);
				patch(subTree, container, instance);

				// 如果是组件，则 vnode.el 就是render执行之后得到的 subtree
				initialVNode.el = subTree;
				instance.isMounted = true;
			} else {
				console.log('update');
			}
		});
	}

	return {
		createApp: createAppAPI(render),
	};
}
