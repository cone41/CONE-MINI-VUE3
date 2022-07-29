import { render } from './renderer';
import { createVNode } from './vnode';

export function createApp(rootComponent) {
	return {
		mount(rootContainer) {
			// 将根组件转换为 VNode
			const vnode = createVNode(rootComponent);
			// 调用 render 函数
			render(vnode, rootContainer);
		},
	};
}
