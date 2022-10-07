import { h, ref } from '../../lib/cone-mini-vue.esm.js'
const text = 'new children'
const arr = [h('div', {}, 'A'), h('div', {}, 'B')]
export default {
    name: '',
    setup() {
        const flag = ref(false);
        window.flag = flag
        return {
            flag
        }
    },
    render() {

        return h('div', {}, this.flag ? text : arr)
    }
}