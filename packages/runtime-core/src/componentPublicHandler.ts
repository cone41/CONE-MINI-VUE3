import { hasOwn } from '@cone-mini-vue/shared';

const publicProxyMaps = {
	$el: (i) => i.vnode.el,
	$slots: (i) => i.slots,
	$props: (i) => i.props,
};
export const componentPublicProxyHandlers = {
	get({ _: instance }, key) {
		const { setupState, props } = instance;

		if (hasOwn(setupState, key)) {
			// 访问 setup 返回值
			return setupState[key];
		} else if (hasOwn(props, key)) {
			// 访问 props
			return props[key];
		}

		const proxyHandler = publicProxyMaps[key];
		return proxyHandler && proxyHandler(instance);
	},
};
