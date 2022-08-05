import { h, ref } from '../../lib/cone-mini-vue.esm.js'
const newText = 'new children'
const oldText = 'old children'
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

        return h('div', {}, this.flag ? newText : oldText)
    }
}