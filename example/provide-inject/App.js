import { h, getCurrentInstance, provide, inject } from '../../lib/cone-mini-vue.esm.js'

const provideComp = {
    name: 'provideComp',
    setup() {
        provide('foo', 'foo1')
        provide('bar', 'bar')
    },
    render() {
        return h('div', {}, [h(provideCompTwo)])
    }
}

const provideCompTwo = {
    name: 'provideCompTwo',
    setup() {
        provide('foo', 'foo2')
        const foo = inject('foo', 'defaultVal')
        const baz = inject('baz', () => 'defaultVal')
        console.log('foo', foo)
        return {
            foo,
            baz
        }
    },
    render() {
        return h('div', {}, [h('p', {}, `${this.baz}`), h('p', {}, `provideCompTwo-${this.foo}`), h(consumerComp)])
    }
}


const consumerComp = {
    name: 'consumerComp',
    setup() {
        const foo = inject('foo')
        const bar = inject('bar')
        return {
            foo, bar
        }
    },
    render() {
        const baz = h('div', {}, `consumerComp-${this.foo}- ${this.bar}`)
        return h('div', {}, [baz])
    }
}


export default {
    name: 'App',
    setup(props) {
    },
    render() {

        return h('div', {}, [h(provideComp)])
    }
}