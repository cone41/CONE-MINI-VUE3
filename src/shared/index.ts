export const extend = Object.assign;

export const isObject = (obj) => {
	// Object.prototype.toString.call(obj).slice(8, -1) === 'Object';
	return obj !== null && typeof obj === 'object';
};

export const hasChanged = (val, newVal) => {
	return !Object.is(val, newVal);
};

export const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
