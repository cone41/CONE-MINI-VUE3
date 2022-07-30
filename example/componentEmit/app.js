import { h } from '../../lib/cone-mini-vue.esm.js'
import Foo from './Foo.js'
window.self = null
export const App = {
    render() {
        window.self = this
        return h('div', {
            class: 'box',
            id: 'root',
        }, [h(Foo, {
            name: 'foo',
            onAdd: this.handleAdd,
            onAddFoo: this.handleAddFoo
        })])
    },
    setup() {
        function handleAdd(a, b) {
            console.log('handleAdd', a, b)
        }
        function handleAddFoo(c, d) {
            console.log('handleAddFoo', c, d)
        }
        return {
            name: 'cone41',
            handleAdd,
            handleAddFoo
        }
    }
}