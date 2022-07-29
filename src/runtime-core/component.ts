import { componentPublicProxyHandlers } from './componentPublicHandler';

export function createComponentInstance(vnode) {
	const component = {
		vnode,
		type: vnode.type,
		setupState: {},

		el: null,
	};
	return component;
}

export function setupComponent(instance) {
	// initProps()
	// initSlots()

	setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: any) {
	const component = instance.type;

	instance.proxy = new Proxy({ _: instance }, componentPublicProxyHandlers);

	const { setup } = component;

	// 如果有 setup 则调用 setup 拿到返回结果
	if (setup) {
		const setupResult = setup();
		handleSetupResult(instance, setupResult);
	}
}

function handleSetupResult(instance, setupResult) {
	// setup 返回对象
	if (typeof setupResult === 'object') {
		instance.setupState = setupResult;
	}

	finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
	const component = instance.type;

	if (component.render) {
		instance.render = component.render;
	}
}
