import { h, getCurrentInstance } from '../../lib/cone-mini-vue.esm.js'
export default {
    name: 'foo',
    setup(props) {
        const instance = getCurrentInstance()
        console.log('foo', instance)

    },
    render() {
        const foo = h('p', {}, 'foo')
        return h('div', {}, [foo])
    }
}