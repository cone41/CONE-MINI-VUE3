import { h, ref } from '../../lib/cone-mini-vue.esm.js'



export default {
    name: 'App',
    setup(props) {
        const count = ref(0)
        const onClick = () => {
            count.value++
        }
        return {
            onClick,
            count
        }
    },
    render() {

        return h('button', {
            onClick: this.onClick
        }, `button--${this.count}`)
    }
}