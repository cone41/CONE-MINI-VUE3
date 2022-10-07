import { shapeFlags } from '@cone-mini-vue/shared';

export function initSlots(instance, children) {
	const { vnode } = instance;
	if (vnode.shapeFlag & shapeFlags.SLOTS_CHILDREN) {
		const slots = {};
		for (const key in children) {
			let value = children[key];
			slots[key] = (props) => normalizeSlotValue(value(props));
		}
		instance.slots = slots;
	}
}

function normalizeSlotValue(value) {
	return Array.isArray(value) ? value : [value];
}
