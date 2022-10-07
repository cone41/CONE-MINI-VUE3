import { h } from '../../dist/cone-mini-vue.esm.js'
import Foo from './Foo.js'
window.self = null
export const App = {
    render() {
        window.self = this
        return h('div', {
            class: 'box',
            id: 'root',
            onClick: () => {
                console.log('click')
            },
            onMousedown: () => {
                console.log('onMousedown')
            }
        }, [h('div', { class: 'div-c' }, `my name is ${this.name}`), h(Foo, { name: 'foo' })])
    },
    setup() {
        return {
            name: 'cone41'
        }
    }
}