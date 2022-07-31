import { h, renderTextVNode } from '../../lib/cone-mini-vue.esm.js'
import Foo from './Foo.js'
export const App = {
    render() {
        const app = h('div', {}, 'app')
        const foo = h(Foo, {}, {
            header: ({ age }) => h('p', {}, 'slot1 / ' + age),
            footer: () => h('p', {}, 'slot2')
        })
        return h('div', {}, [app, foo, renderTextVNode('hello vue3')])
    },
    setup() {

    }
}