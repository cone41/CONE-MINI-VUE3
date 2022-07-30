import { h } from '../../lib/cone-mini-vue.esm.js'
export default {
    setup(props, { emit }) {
        console.log('props', props)
        // props.name = 'cone'
        function handleEmit() {
            console.log('handleEmit')
            emit('add', 1, 2)
            emit('add-foo', 3, 4)
        }

        return {
            handleEmit
        }
    },
    render() {
        const btn = h('button', {
            onClick: this.handleEmit
        }, 'emitAdd')
        return h('div', { name: 'foo' }, [btn])
    }
}