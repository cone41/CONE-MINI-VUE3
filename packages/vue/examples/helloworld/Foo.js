import { h } from '../../dist/cone-mini-vue.esm.js'
export default {
    setup(props) {
        console.log('props', props)
        return {
            name: 'foo'
        }
    },
    render() {
        return h('div', { name: 'foo' }, `我是${this.name}组件`)
    }
}