import { h, ref } from '../../lib/cone-mini-vue.esm.js'

import ArrayToText from './ArrayToText.js'
import TextToArray from './TextToArray.js'
import TextToText from './TextToText.js'

export default {
    name: 'App',
    setup(props) {
        const count = ref(0)
        const onClick = () => {
            count.value++
        }
        let baz = ref({
            foo: 'foo',
            bar: 'bar'
        })
        function handleChangeProps() {
            baz.value.foo = 'foo1'
        }
        function handleChangePropsToUndefined() {
            baz.value.foo = undefined
        }
        function handleDeleteProps() {
            baz.value = {
                foo: 'foo'
            }
        }
        return {
            onClick,
            count,
            baz,
            handleChangeProps,
            handleChangePropsToUndefined,
            handleDeleteProps
        }
    },
    render() {
        const button1 = h('button', {
            onClick: this.handleChangeProps
        }, '修改 props的值')
        const button2 = h('button', {
            onClick: this.handleChangePropsToUndefined
        }, '修改 props的值为 undefined')
        const button3 = h('button', {
            onClick: this.handleDeleteProps
        }, ' 删除 props')
        const button = h('button', {
            onClick: this.onClick
        }, `button--${this.count}`)
        return h('div', { ...this.baz }, [
            button1, button2, button3, button,
            // h(ArrayToText)
            h(TextToArray)
            // h(TextToText)
        ])
    }
}