import { h, ref } from '../../lib/cone-mini-vue.esm.js'

import ArrayToText from './ArrayToText.js'
import TextToArray from './TextToArray.js'
import TextToText from './TextToText.js'
import ArrayToArray from './ArrayToArray.js'

const Child = {
    setup() {
        const count = ref(1)
        function click() {
            count.value++
        }
        return {
            count,
            click
        }
    },
    render() {
        return h('div', {}, [h('div', {}, 'child:' + this.$props.msg), h('button', {
            onClick: this.click
        }, 'count++'), h('div', {}, 'count:' + this.count)])
    }
}

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
        const msg = ref('我是 msg')
        window.msg = msg
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
        function changeMsg() {
            msg.value = 'xixixi'
            console.log('asdas')
        }
        return {
            onClick,
            count,
            baz,
            handleChangeProps,
            handleChangePropsToUndefined,
            handleDeleteProps,
            changeMsg,
            msg
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
        const button4 = h('button', {
            onClick: this.changeMsg
        }, `button--修改 msg`)
        return h('div', { ...this.baz }, [
            button1, button2, button3, button, button4,
            // h(ArrayToText)
            // h(TextToArray)
            // h(TextToText)
            // h(ArrayToArray)
            h(Child, { msg: this.msg })
        ])
    }
}