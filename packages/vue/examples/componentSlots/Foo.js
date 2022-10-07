import { h, renderSlots } from '../../lib/cone-mini-vue.esm.js'
export default {
    setup(props, { emit }) {


    },
    render() {
        const foo = h('p', {}, 'foo')
        console.log(this.$slots)
        // 具名插槽
        // 作用域插槽
        return h('div', {}, [renderSlots(this.$slots, 'header', {
            age: 18
        }), foo, renderSlots(this.$slots, 'footer')])
    }
}