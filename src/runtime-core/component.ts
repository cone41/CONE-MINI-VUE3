import { shallowReadonly } from '../reactivity/reactive';
import { emit } from './componentEmit';
import { initProps } from './componentProps';
import { componentPublicProxyHandlers } from './componentPublicHandler';
import { initSlots } from './componentSlots';

export function createComponentInstance(vnode) {
	const instance = {
		vnode,
		type: vnode.type,
		setupState: {},
		el: null,
		emit: () => {},
	};

	// 绑定 emit 第一个参数
	instance.emit = emit.bind(null, instance) as any;
	return instance;
}

export function setupComponent(instance) {
	// 初始化 props
	const { props, children } = instance.vnode;
	initProps(instance, props);
	initSlots(instance, children);

	setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: any) {
	const component = instance.type;

	instance.proxy = new Proxy({ _: instance }, componentPublicProxyHandlers);

	const { setup } = component;
	const { props } = instance;
	// 如果有 setup 则调用 setup 拿到返回结果
	if (setup) {
		// props 是个浅层只读
		const setupResult = setup(shallowReadonly(props), {
			emit: instance.emit,
		});
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
