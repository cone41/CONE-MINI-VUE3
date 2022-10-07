const Fragment = Symbol('fragment');
const Text = Symbol('Text');
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        key: props && props.key,
        shapeFlag: getShapeFlag(type),
        el: null,
    };
    // |  按位或   0 | 0 = 0
    // 0101 == ELEMENT & TEXT_CHILDREN  ===> element类型且 children 是 文本
    if (typeof children === 'string') {
        vnode.shapeFlag |= 4 /* shapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* shapeFlags.ARRAY_CHILDREN */;
    }
    // slot类型 -> 是组件且children是对象
    if (vnode.shapeFlag & 2 /* shapeFlags.STATEFUL_COMPONENT */) {
        if (typeof children === 'object') {
            vnode.shapeFlag |= 16 /* shapeFlags.SLOTS_CHILDREN */;
        }
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === 'string' ? 1 /* shapeFlags.ELEMENT */ : 2 /* shapeFlags.STATEFUL_COMPONENT */;
}
function renderTextVNode(text) {
    return createVNode(Text, {}, text);
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

const extend = Object.assign;
const isObject = (obj) => {
    // Object.prototype.toString.call(obj).slice(8, -1) === 'Object';
    return obj !== null && typeof obj === 'object';
};
const hasChanged = (val, newVal) => {
    return !Object.is(val, newVal);
};
const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const EMPTY_OBJ = {};

let activeEffect;
let shouldTrack;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.active = true;
        this.deps = [];
        this._fn = fn;
        this.scheduler = scheduler;
    }
    //
    run() {
        // 调用 stop 之后不走依赖收集的逻辑
        if (!this.active) {
            return this._fn();
        }
        // 逻辑走到这里表示应该要收集依赖
        shouldTrack = true;
        //当前的 effect实例
        activeEffect = this;
        const ret = this._fn();
        //reset flag
        shouldTrack = false;
        return ret;
    }
    stop() {
        // 多次调用 stop，只执行一次
        if (this.active) {
            cleanUpEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function cleanUpEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
// 收集依赖
let targetMap = new Map();
function track(target, key) {
    if (!isTracking())
        return;
    // 外层的响应式对象
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        //一个 key 可能对应多个副作用函数，所以使用 set
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
// 是否需要收集依赖
// 如果响应式数据的属性没有被 effect用到，则 activeEffect 为 undefined
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
// 触发依赖
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    if (!depsMap)
        return;
    let dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}
function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    extend(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}
function stop(runner) {
    runner.effect.stop();
}

// 初始化调用一次即可
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, isShallow = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* ReactiveFlag.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlag.IS_READONLY */) {
            return isReadonly;
        }
        const ret = Reflect.get(target, key);
        if (isShallow) {
            return ret;
        }
        if (isObject(ret)) {
            return isReadonly ? readonly(ret) : reactive(ret);
        }
        if (!isReadonly) {
            // 收集依赖
            track(target, key);
        }
        return ret;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const ret = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key);
        return ret;
    };
}
const mutableHandlers = {
    get,
    set,
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        // set 时不可修改
        console.warn(`key:${key} can not be set, because target is readonly`, target);
        return true;
    },
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet,
});

function reactive(raw) {
    return createReactiveObject(raw, mutableHandlers);
}
// 无需收集依赖
function readonly(raw) {
    return createReactiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createReactiveObject(raw, shallowReadonlyHandlers);
}
function createReactiveObject(target, baseHandler) {
    if (!isObject(target)) {
        console.warn(`target must be an Object`, target);
        return target;
    }
    return new Proxy(target, baseHandler);
}

class RefImpl {
    constructor(value) {
        this.__v_isRef = true;
        // 记录原始对象用于 set 时比较
        this._rawVal = value;
        this._dep = new Set();
        this._value = convert(value);
    }
    get value() {
        if (isTracking()) {
            trackEffects(this._dep);
        }
        return this._value;
    }
    set value(newVal) {
        // 如果value 没有改变则不需要更新
        if (hasChanged(newVal, this._rawVal)) {
            this._rawVal = newVal;
            this._value = convert(newVal);
            triggerEffects(this._dep);
        }
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function ref(val) {
    return new RefImpl(val);
}
function isRef(ref) {
    return !!ref.__v_isRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            // 如果是 ref，则返回.value
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return (target[key].value = value);
            }
            else {
                return Reflect.set(target, key, value);
            }
        },
    });
}

function emit(instance, event, ...rest) {
    const { props } = instance;
    // 去 props 找有没有对应的事件 ，on + Event形式
    // add -> onAdd
    // add-foo -> onAddFoo
    const camelize = (str) => {
        return str.replace(/-(\w)/g, (_, c) => {
            return c ? c.toUpperCase() : '';
        });
    };
    // 首字母转大写
    const capitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };
    // 拼接成 on 开头的 name
    const toHandlerName = (str) => {
        return event ? `on${capitalize(str)}` : '';
    };
    const handlerName = toHandlerName(camelize(event));
    const handler = props[handlerName];
    handler && handler(...rest);
}

function initProps(instance, props) {
    instance.props = props || {};
}

const publicProxyMaps = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
    $props: (i) => i.props,
};
const componentPublicProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            // 访问 setup 返回值
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            // 访问 props
            return props[key];
        }
        const proxyHandler = publicProxyMaps[key];
        return proxyHandler && proxyHandler(instance);
    },
};

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* shapeFlags.SLOTS_CHILDREN */) {
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

function createComponentInstance(vnode, parent) {
    const instance = {
        vnode,
        type: vnode.type,
        setupState: {},
        el: null,
        component: null,
        provides: parent ? parent.provides : {},
        parent,
        isMounted: false,
        subTree: null,
        emit: () => { },
    };
    // 绑定 emit 第一个参数
    instance.emit = emit.bind(null, instance);
    return instance;
}
function setupComponent(instance) {
    // 初始化 props
    const { props, children } = instance.vnode;
    initProps(instance, props);
    initSlots(instance, children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const component = instance.type;
    instance.proxy = new Proxy({ _: instance }, componentPublicProxyHandlers);
    const { setup } = component;
    const { props } = instance;
    // 如果有 setup 则调用 setup 拿到返回结果
    if (setup) {
        setCurrentInstance(instance);
        // props 是个浅层只读
        const setupResult = setup(shallowReadonly(props), {
            emit: instance.emit,
        });
        setCurrentInstance(null);
        if (!setupResult) {
            console.warn('setup must have return value');
            return;
        }
        handleSetupResult(instance, proxyRefs(setupResult));
    }
}
function handleSetupResult(instance, setupResult) {
    // setup 返回对象
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const component = instance.type;
    if (component.render) {
        instance.render = component.render;
    }
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

// 导出 provide 、inject 函数
function provide(key, value) {
    // 获取当前组件实例
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;
        // 第一次调用 provide
        if (provides === parentProvides) {
            // Object.create 将 parentProvides 指向 provide 的原型
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultVal) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultVal) {
            return typeof defaultVal === 'function' ? defaultVal() : defaultVal;
        }
    }
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // 将根组件转换为 VNode
                const vnode = createVNode(rootComponent);
                // 调用 render 函数
                render(vnode, rootContainer);
            },
        };
    };
}

function shouldUpdateComponent(prevVNode, nextVNode) {
    const { props: prevProps } = prevVNode;
    const { props: nextProps } = nextVNode;
    for (const key in prevProps) {
        if (prevProps[key] !== nextProps[key]) {
            return true;
        }
    }
    return false;
}

let queue = [];
let isFlushPending = false;
const p = Promise.resolve();
function nextTick(fn) {
    if (typeof fn === 'function') {
        return p.then(fn);
    }
    else {
        return p;
    }
}
function queueJobs(job) {
    if (!queue.includes(job)) {
        queue.push(job);
    }
    queueFlush();
}
function queueFlush() {
    if (isFlushPending)
        return;
    isFlushPending = true;
    return nextTick(flushJobs);
}
function flushJobs() {
    isFlushPending = false;
    while (queue.length) {
        queue.shift()();
    }
}

function createRenderer(options) {
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
                if (shapeFlag & 1 /* shapeFlags.ELEMENT */) {
                    // 处理 element
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else if (shapeFlag & 2 /* shapeFlags.STATEFUL_COMPONENT */) {
                    // 处理组件
                    processComponent(n1, n2, container, parentComponent, anchor);
                }
        }
    }
    // 处理 fragment节点、直接 path children
    function processFragment(n1, n2, container, parentComponent, anchor) {
        mountChildren(n2.children, container, parentComponent, anchor);
    }
    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountElement(n2, container, parentComponent, anchor);
        }
        else {
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
        if (nextShapeFlag & 4 /* shapeFlags.TEXT_CHILDREN */) {
            if (prevShapeFlag & 8 /* shapeFlags.ARRAY_CHILDREN */) {
                // 1. 新children是text ,旧children是 array
                // 删除 array children
                unmountChildren(n1.children);
            }
            // 2. 新children是 text，旧children也是 text
            if (c1 !== c2) {
                hostSetElementText(el, c2);
            }
        }
        else {
            if (prevShapeFlag & 4 /* shapeFlags.TEXT_CHILDREN */) {
                // 3. 新children是 array，旧children是 text
                hostSetElementText(el, '');
                mountChildren(n2.children, el, parentComponent, anchor);
            }
            else {
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
            }
            else {
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
            }
            else {
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
        }
        else if (i > l2) {
            //老的比新的多，删除
            while (i <= l1) {
                hostRemove(c1[i].el);
                i++;
            }
        }
        else {
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
                }
                else {
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
                }
                else {
                    // 如果节点 index 一直是递增，则说明无需移动
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex;
                    }
                    else {
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
                }
                else if (moved) {
                    if (j < 0 || i !== increasingNewIndexSequence[j]) {
                        // 如果当前遍历的下标不在最长递增子序列里，则需要移动
                        hostInsert(nextChild.el, container, anchor);
                    }
                    else {
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
    function processTextVNode(n1, n2, container) {
        const { children } = n2;
        const textVNode = (n2.el = document.createTextNode(children));
        container.append(textVNode);
    }
    function mountElement(vnode, container, parentComponent, anchor) {
        const { type, props, children, shapeFlag } = vnode;
        // 将 el 挂载到 vnode 上
        const el = (vnode.el = hostCreateElement(type));
        for (const key in props) {
            const val = props[key];
            hostPatchProps(el, key, null, val);
        }
        if (shapeFlag & 4 /* shapeFlags.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* shapeFlags.ARRAY_CHILDREN */) {
            mountChildren(children, el, parentComponent, anchor);
        }
        hostInsert(el, container, anchor);
    }
    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach((v) => {
            patch(null, v, container, parentComponent, anchor);
        });
    }
    function processComponent(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountComponent(n2, container, parentComponent, anchor);
        }
        else {
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
        }
        else {
            n2.el = n1.el;
            instance.vnode = n2;
        }
    }
    function mountComponent(initialVNode, container, parentComponent, anchor) {
        // 创建组件实例
        const instance = (initialVNode.component = createComponentInstance(initialVNode, parentComponent));
        setupComponent(instance);
        setupRenderEffect(instance, initialVNode, container, anchor);
    }
    function setupRenderEffect(instance, initialVNode, container, anchor) {
        // 通过 effect 会将 render 执行的结果当做依赖收集起来，修改之后会再次执行
        // 利用 effect 的调度功能，将组件 update功能挂载到 instance 上，供 updateComponent 调用
        instance.update = effect(() => {
            if (!instance.isMounted) {
                // 第一次 render
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy));
                patch(null, subTree, container, instance, anchor);
                // 如果是组件，则 vnode.el 就是render执行之后得到的 subtree
                initialVNode.el = subTree;
                instance.isMounted = true;
            }
            else {
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
        }, {
            scheduler() {
                queueJobs(instance.update);
            },
        });
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
                }
                else {
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

// 抽离平台特定代码
function createElement(type) {
    return document.createElement(type);
}
function patchProps(el, key, prevVal, nextVal) {
    const isOn = (e) => /^on[A-Z]/.test(e);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, nextVal);
    }
    else {
        if (nextVal === undefined || nextVal === null) {
            el.removeAttribute(key, nextVal);
        }
        else {
            el.setAttribute(key, nextVal);
        }
    }
}
function insert(el, parent, anchor) {
    parent.insertBefore(el, anchor || null);
}
function remove(el) {
    const parentNode = el.parentNode;
    parentNode.removeChild(el);
}
function setElementText(el, text) {
    el.textContent = text;
}
const renderer = createRenderer({
    createElement,
    patchProps,
    insert,
    remove,
    setElementText,
});
function createApp(...args) {
    return renderer.createApp(...args);
}

export { createApp, createRenderer, effect, getCurrentInstance, h, inject, nextTick, provide, proxyRefs, ref, renderSlots, renderTextVNode, shallowReadonly, stop };
