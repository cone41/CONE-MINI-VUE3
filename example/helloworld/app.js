import { h } from '../../lib/cone-mini-vue.esm.js'
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
        }, `hi,我是${this.name}`)
    },
    setup() {
        return {
            name: 'cone41'
        }
    }
}