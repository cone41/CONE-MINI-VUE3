import { EMPTY_OBJ, isObject } from '@cone-mini-vue/shared';
import { shapeFlags } from '@cone-mini-vue/shared';
import { createComponentInstance, setupComponent } from './component';
import { Fragment, Text } from './vnode';
import { createAppAPI } from './createApp';
import { effect } from '@cone-mini-vue/reactivity';
import { shouldUpdateComponent } from './componentUpdateUtils';
import { queueJobs } from './scheduler';

export function createRenderer(options) {
	const { createElement: hostCreateElement, patchProps: hostPatchProps, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText } = options;
	function render(vnode, container) {
		// patch
		patch(null, vnode, container, null, null);
	}

	function patch(n1, n2, container, parentComponent, anchor) {
		const { shapeFlag, type } = n2;
		switch (type) {
			case Fragment:
				processFragment(n1, n2, container, parentComponent, anchor);
				break;
			case Text:
				processTextVNode(n1, n2, container);
				break;
			default:
				if (shapeFlag & shapeFlags.ELEMENT) {
					// 处理 element
					processElement(n1, n2, container, parentComponent, anchor);
				} else if (shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
					// 处理组件
					processComponent(n1, n2, container, parentComponent, anchor);
				}
		}
	}

	// 处理 fragment节点、直接 path children
	function processFragment(n1, n2: any, container: any, parentComponent, anchor) {
		mountChildren(n2.children, container, parentComponent, anchor);
	}

	function processElement(n1, n2: any, container: any, parentComponent, anchor) {
		if (!n1) {
			mountElement(n2, container, parentComponent, anchor);
		} else {
			patchElement(n1, n2, container, parentComponent, anchor);
		}
	}

	// 更新 element
	function patchElement(n1, n2, container, parentComponent, anchor) {
		console.log('n1', n1);
		console.log('n2', n2);

		const prevProps = n1.props || EMPTY_OBJ;
		const nextProps = n2.props || EMPTY_OBJ;

		const el = (n2.el = n1.el); //更新 新的 el;
		patchProps(el, prevProps, nextProps);
		patchChildren(n1, n2, el, parentComponent, anchor);
	}

	function patchChildren(n1, n2, el, parentComponent, anchor) {
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
				mountChildren(n2.children, el, parentComponent, anchor);
			} else {
				// diff
				patchKeyedChildren(c1, c2, el, parentComponent, anchor);
			}
		}
	}

	// 核心 diff
	function patchKeyedChildren(c1, c2, container, parentComponent, anchor) {
		let l1 = c1.length - 1;
		let l2 = c2.length - 1;
		let i = 0;
		function isSameVNodeType(n1, n2) {
			return n1.type === n2.type && n1.key === n2.key;
		}
		// 左侧收缩
		while (i <= l1 && i <= l2) {
			const n1 = c1[i];
			const n2 = c2[i];
			if (isSameVNodeType(n1, n2)) {
				patch(n1, n2, container, parentComponent, anchor);
			} else {
				break;
			}
			i++;
		}

		// 右侧收缩
		while (i <= l1 && i <= l2) {
			const n1 = c1[l1];
			const n2 = c2[l2];
			if (isSameVNodeType(n1, n2)) {
				patch(n1, n2, container, parentComponent, anchor);
			} else {
				break;
			}
			l1--;
			l2--;
		}

		// 新的比老的多，创建
		if (i > l1) {
			if (i <= l2) {
				const nextPos = l2 + 1;
				const anchor = nextPos < c2.length ? c2[nextPos].el : null;
				while (i <= l2) {
					patch(null, c2[i], container, parentComponent, anchor);
					i++;
				}
			}
		} else if (i > l2) {
			//老的比新的多，删除
			while (i <= l1) {
				hostRemove(c1[i].el);
				i++;
			}
		} else {
			// 新老都有，需要比较中间部分，
			//! diff 核心
			const s1 = i;
			const s2 = i;
			const toBePatched = l2 - s2 + 1; //计算中间部分的长度

			let patched = 0;
			// 对新的children建立 key 和 下标的 map 映射
			const keyToNewIndexMap = new Map();
			// 新节点和老节点的映射关系，便于查找最长递增子序列
			const newIndexToOldIndexMap = new Array(toBePatched).fill(0);
			let moved = false;
			let maxNewIndexSoFar = 0;
			for (let i = s2; i <= l2; i++) {
				keyToNewIndexMap.set(c2[i].key, i);
			}

			for (let i = s1; i <= l1; i++) {
				const prevChild = c1[i];
				// 如果patch次数超过需要新增新节点的数量了，则剩下的老节点则无须比较，直接删除即可
				if (patched >= toBePatched) {
					hostRemove(prevChild.el);
					continue;
				}

				let newIndex;
				// 在新的里面找当前老节点下标
				if (prevChild.key !== undefined) {
					// 先通过 key 查找
					newIndex = keyToNewIndexMap.get(prevChild.key);
				} else {
					// 没有 key 则遍历查找
					for (let j = s2; j <= l2; j++) {
						if (isSameVNodeType(prevChild, c2[j])) {
							newIndex = j;
							break;
						}
					}
				}
				if (newIndex === undefined) {
					hostRemove(prevChild.el);
				} else {
					// 如果节点 index 一直是递增，则说明无需移动
					if (newIndex >= maxNewIndexSoFar) {
						maxNewIndexSoFar = newIndex;
					} else {
						moved = true;
					}
					// key 为当前节点在new children 中的下标 - i
					// value 为 当前节点在 old children 中的下标 + 1
					newIndexToOldIndexMap[newIndex - s2] = i + 1;
					// 继续 patch 当前节点
					patch(prevChild, c2[newIndex], container, parentComponent, null);
					patched++;
				}
			}
			console.log('newIndexToOldIndexMap', newIndexToOldIndexMap);
			// 找到最长的递增子序列，返回在new children 中的 下标
			const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
			console.log('increasingNewIndexSequence', increasingNewIndexSequence);
			let j = increasingNewIndexSequence.length - 1;

			//从后往前遍历 new children，可以保证每一次插入的 anchor 是经过对比的
			for (let i = toBePatched - 1; i >= 0; i--) {
				const nextIndex = i + s2;
				const nextChild = c2[nextIndex];
				const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null;

				if (newIndexToOldIndexMap[i] === 0) {
					// 新老没有建立映射的话，即在老的里面没有找到新的，则需要创建
					patch(null, nextChild, container, parentComponent, anchor);
				} else if (moved) {
					if (j < 0 || i !== increasingNewIndexSequence[j]) {
						// 如果当前遍历的下标不在最长递增子序列里，则需要移动
						hostInsert(nextChild.el, container, anchor);
					} else {
						j--;
					}
				}
			}
		}
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

	function mountElement(vnode: any, container: any, parentComponent, anchor) {
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
			mountChildren(children, el, parentComponent, anchor);
		}
		hostInsert(el, container, anchor);
	}

	function mountChildren(children, container, parentComponent, anchor) {
		children.forEach((v) => {
			patch(null, v, container, parentComponent, anchor);
		});
	}

	function processComponent(n1, n2: any, container: any, parentComponent, anchor) {
		if (!n1) {
			mountComponent(n2, container, parentComponent, anchor);
		} else {
			updateComponent(n1, n2);
		}
	}

	// 更新 component
	function updateComponent(n1, n2) {
		const instance = (n2.component = n1.component);
		// props有变化才执行 update
		if (shouldUpdateComponent(n1, n2)) {
			// 将新的 component 挂载到 实例的 next 上，便于 update 函数里对比
			instance.next = n2;
			instance.update();
		} else {
			n2.el = n1.el;
			instance.vnode = n2;
		}
	}

	function mountComponent(initialVNode: any, container: any, parentComponent, anchor) {
		// 创建组件实例
		const instance = (initialVNode.component = createComponentInstance(initialVNode, parentComponent));
		setupComponent(instance);
		setupRenderEffect(instance, initialVNode, container, anchor);
	}

	function setupRenderEffect(instance: any, initialVNode, container, anchor) {
		// 通过 effect 会将 render 执行的结果当做依赖收集起来，修改之后会再次执行
		// 利用 effect 的调度功能，将组件 update功能挂载到 instance 上，供 updateComponent 调用
		instance.update = effect(
			() => {
				if (!instance.isMounted) {
					// 第一次 render
					const { proxy } = instance;
					const subTree = (instance.subTree = instance.render.call(proxy));
					patch(null, subTree, container, instance, anchor);

					// 如果是组件，则 vnode.el 就是render执行之后得到的 subtree
					initialVNode.el = subTree;
					instance.isMounted = true;
				} else {
					// re-render

					const { proxy, next } = instance;
					if (next) {
						updateComponentReRender(instance, next);
					}
					// 重新执行 render 得到更新后的虚拟 dom
					const subTree = instance.render.call(proxy);
					const prevTree = instance.subTree;
					instance.subTree = subTree;
					patch(prevTree, subTree, container, instance, anchor);
				}
			},
			{
				scheduler() {
					queueJobs(instance.update);
				},
			}
		);
	}

	function updateComponentReRender(instance, nextVNode) {
		instance.vnode = nextVNode;
		instance.props = nextVNode.props;
		instance.next = null;
	}

	return {
		createApp: createAppAPI(render),
	};
}

// 最长递增子序列
function getSequence(arr) {
	const p = arr.slice();
	const result = [0];
	let i, j, u, v, c;
	const len = arr.length;
	for (i = 0; i < len; i++) {
		const arrI = arr[i];
		if (arrI !== 0) {
			j = result[result.length - 1];
			if (arr[j] < arrI) {
				p[i] = j;
				result.push(i);
				continue;
			}
			u = 0;
			v = result.length - 1;
			while (u < v) {
				c = (u + v) >> 1;
				if (arr[result[c]] < arrI) {
					u = c + 1;
				} else {
					v = c;
				}
			}
			if (arrI < arr[result[u]]) {
				if (u > 0) {
					p[i] = result[u - 1];
				}
				result[u] = i;
			}
		}
	}
	u = result.length;
	v = result[u - 1];
	while (u-- > 0) {
		result[u] = v;
		v = p[v];
	}
	return result;
}
