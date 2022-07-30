import { hasOwn } from '../shared/index';

const publicProxyMaps = {
	$el: (i) => i.vnode.el,
	$slots: (i) => i.slots,
};
export const componentPublicProxyHandlers = {
	get({ _: instance }, key) {
		const { setupState, props } = instance;

		if (hasOwn(setupState, key)) {
			return setupState[key];
		} else if (hasOwn(props, key)) {
			return props[key];
		}

		const proxyHandler = publicProxyMaps[key];
		return proxyHandler && proxyHandler(instance);
	},
};
