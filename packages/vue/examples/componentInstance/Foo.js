import { h, getCurrentInstance } from '../../dist/cone-mini-vue.esm.js'
export default {
    name: 'foo',
    setup(props) {
        const instance = getCurrentInstance()
        console.log('foo', instance)
        return {}

    },
    render() {
        const foo = h('p', {}, 'foo')
        return h('div', {}, [foo])
    }
}