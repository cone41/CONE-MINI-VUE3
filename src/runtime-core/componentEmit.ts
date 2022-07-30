export function emit(instance, event: string, ...rest: any[]) {
	const { props } = instance;
	// 去 props 找有没有对应的事件 ，on + Event形式

	// add -> onAdd
	// add-foo -> onAddFoo
	const camelize = (str) => {
		return str.replace(/-(\w)/g, (_, c: string) => {
			return c ? c.toUpperCase() : '';
		});
	};

	// 首字母转大写
	const capitalize = (str: string) => {
		return str.charAt(0).toUpperCase() + str.slice(1);
	};
	// 拼接成 on 开头的 name
	const toHandlerName = (str: string) => {
		return event ? `on${capitalize(str)}` : '';
	};

	const handlerName = toHandlerName(camelize(event));
	const handler = props[handlerName];

	handler && handler(...rest);
}
