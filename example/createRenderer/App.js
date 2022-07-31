import { h, getCurrentInstance, provide, inject } from '../../lib/cone-mini-vue.esm.js'



export default {
    name: 'App',
    setup(props) {
        return {
            x: 100,
            y: 100
        }
    },
    render() {

        return h('rect', { x: this.x, y: this.y },)
    }
}