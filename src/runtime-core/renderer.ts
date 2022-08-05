import { EMPTY_OBJ, isObject } from '../shared/index';
import { shapeFlags } from '../shared/shapeFlags';
import { createComponentInstance, setupComponent } from './component';
import { Fragment, Text } from './vnode';
import { createAppAPI } from './createApp';
import { effect } from '../reactivity/effect';

export function createRenderer(options) {
	const { createElement: hostCreateElement, patchProps: hostPatchProps, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText } = options;
	function render(vnode, container) {
		// patch
		patch(null, vnode, container, null);
	}

	function patch(n1, n2, container, parentComponent) {
		const { shapeFlag, type } = n2;
		switch (type) {
			case Fragment:
				processFragment(n1, n2, container, parentComponent);
				break;
			case Text:
				processTextVNode(n1, n2, container);
				break;
			default:
				if (shapeFlag & shapeFlags.ELEMENT) {
					// 处理 element
					processElement(n1, n2, container, parentComponent);
				} else if (shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
					// 处理组件
					processComponent(n1, n2, container, parentComponent);
				}
		}
	}

	// 处理 fragment节点、直接 path children
	function processFragment(n1, n2: any, container: any, parentComponent) {
		mountChildren(n2.children, container, parentComponent);
	}

	function processElement(n1, n2: any, container: any, parentComponent) {
		if (!n1) {
			mountElement(n2, container, parentComponent);
		} else {
			patchElement(n1, n2, container, parentComponent);
		}
	}

	// 更新 element
	function patchElement(n1, n2, container, parentComponent) {
		console.log('n1', n1);
		console.log('n2', n2);

		const prevProps = n1.props || EMPTY_OBJ;
		const nextProps = n2.props || EMPTY_OBJ;

		const el = (n2.el = n1.el); //更新 新的 el;
		patchProps(el, prevProps, nextProps);
		patchChildren(n1, n2, el, parentComponent);
	}

	function patchChildren(n1, n2, el, parentComponent) {
		// 4. 新旧children都是 array，diff
		const prevShapeFlag = n1.shapeFlag;
		const nextShapeFlag = n2.shapeFlag;
		const c1 = n1.children;
		const c2 = n2.children;
		if (nextShapeFlag & shapeFlags.TEXT_CHILDREN) {
			if (prevShapeFlag & shapeFlags.ARRAY_CHILDREN) {
				// 1. 新children是text ,旧children是 array
				// 删除 array children
				unmountChildren(n1.children);
			}
			// 2. 新children是 text，旧children也是 text
			if (c1 !== c2) {
				hostSetElementText(el, c2);
			}
		} else {
			if (prevShapeFlag & shapeFlags.TEXT_CHILDREN) {
				// 3. 新children是 array，旧children是 text
				hostSetElementText(el, '');
				mountChildren(n2.children, el, parentComponent);
			} else {
				// diff
				patchKeyedChildren(c1, c2);
			}
		}
	}

	function patchKeyedChildren(n1, n2) {
		// TODO
	}

	function unmountChildren(children) {
		for (let i = 0; i < children.length; i++) {
			const el = children[i].el;
			hostRemove(el);
		}
	}

	function patchProps(el, prevProps, nextProps) {
		if (prevProps !== nextProps) {
			for (const key in nextProps) {
				const prevProp = prevProps[key];
				const nextProp = nextProps[key];

				if (prevProp !== nextProp) {
					hostPatchProps(el, key, prevProp, nextProp);
				}
			}

			if (prevProps !== EMPTY_OBJ) {
				// 删除 prop
				for (const key in prevProps) {
					if (!(key in nextProps)) {
						hostPatchProps(el, key, prevProps[key], null);
					}
				}
			}
		}
	}

	// 文本节点，直接 createTextNode
	function processTextVNode(n1, n2: any, container: any) {
		const { children } = n2;
		const textVNode = (n2.el = document.createTextNode(children));
		container.append(textVNode);
	}

	function mountElement(vnode: any, container: any, parentComponent) {
		const { type, props, children, shapeFlag } = vnode;
		// 将 el 挂载到 vnode 上
		const el = (vnode.el = hostCreateElement(type));

		for (const key in props) {
			const val = props[key];
			hostPatchProps(el, key, null, val);
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
			patch(null, v, container, parentComponent);
		});
	}

	function processComponent(n1, n2: any, container: any, parentComponent) {
		mountComponent(n2, container, parentComponent);
	}

	function mountComponent(initialVNode: any, container: any, parentComponent) {
		// 创建组件实例
		const instance = createComponentInstance(initialVNode, parentComponent);
		setupComponent(instance);
		setupRenderEffect(instance, initialVNode, container);
	}

	function setupRenderEffect(instance: any, initialVNode, container) {
		// 通过 effect 会将 render 执行的结果当做依赖收集起来，修改之后会再次执行
		effect(() => {
			if (!instance.isMounted) {
				const { proxy } = instance;
				const subTree = (instance.subTree = instance.render.call(proxy));
				patch(null, subTree, container, instance);

				// 如果是组件，则 vnode.el 就是render执行之后得到的 subtree
				initialVNode.el = subTree;
				instance.isMounted = true;
			} else {
				const { proxy } = instance;
				// 重新执行 render 得到更新后的虚拟 dom
				const subTree = instance.render.call(proxy);
				const prevTree = instance.subTree;
				instance.subTree = subTree;
				patch(prevTree, subTree, container, instance);
			}
		});
	}

	return {
		createApp: createAppAPI(render),
	};
}
