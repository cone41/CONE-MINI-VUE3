const publicProxyMaps = {
	$el: (i) => i.vnode.el,
};
export const componentPublicProxyHandlers = {
	get({ _: instance }, key) {
		const { setupState } = instance;
		if (key in setupState) {
			return setupState[key];
		}
		const proxyHandler = publicProxyMaps[key];
		return proxyHandler && proxyHandler(instance);
	},
};
