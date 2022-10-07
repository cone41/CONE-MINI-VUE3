import { h, ref, getCurrentInstance, nextTick } from '../../lib/cone-mini-vue.esm.js'
export const App = {
    render() {
        return h('div', {
            onClick: this.handleClick
        }, 'count:' + this.count)
    },
    setup() {
        const count = ref(1)
        const instance = getCurrentInstance()
        async function handleClick() {
            for (let i = 0; i < 100; i++) {
                count.value = i
            }
            // console.log('instance', instance)
            // nextTick(() => {
            //     console.log('instance', instance)
            // })

            await nextTick()
            console.log('instance', instance)
        }
        return {
            count,
            handleClick
        }
    }
}