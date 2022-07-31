import { h, getCurrentInstance } from '../../lib/cone-mini-vue.esm.js'
import Foo from './Foo.js'
export const App = {
    name: 'app',
    render() {
        const app = h('div', {}, 'app')
        const foo = h(Foo, {}, 'foo')
        return h('div', {}, [app, foo])
    },
    setup() {
        const instance = getCurrentInstance()
        console.log('app', instance)
    }
}