import { h, ref } from '../../lib/cone-mini-vue.esm.js'
// 左侧对比
// a b c
// a b d e
// const prevChildren = [
//     h('p', { key: 'A' }, 'A'),
//     h('p', { key: 'B' }, 'B'),
//     h('p', { key: 'C' }, 'C')
// ]
// const nextChildren = [
//     h('p', { key: 'A' }, 'A'),
//     h('p', { key: 'B' }, 'B'),
//     h('p', { key: 'D' }, 'D'),
//     h('p', { key: 'E' }, 'E')
// ]

// 右侧对比
//   a b c
// d e b c
// const prevChildren = [
//     h('p', { key: 'A' }, 'A'),
//     h('p', { key: 'B' }, 'B'),
//     h('p', { key: 'C' }, 'C')
// ]
// const nextChildren = [
//     h('p', { key: 'D' }, 'D'),
//     h('p', { key: 'E' }, 'E'),
//     h('p', { key: 'B' }, 'B'),
//     h('p', { key: 'C' }, 'C')
// ]

// 新的比老的多，需要创建
//! 右侧
// const prevChildren = [
//     h('p', { key: 'A' }, 'A'),
//     h('p', { key: 'B' }, 'B'),
// ]
// const nextChildren = [
//     h('p', { key: 'A' }, 'A'),
//     h('p', { key: 'B' }, 'B'),
//     h('p', { key: 'C' }, 'C'),
//     h('p', { key: 'D' }, 'D')
// ]

//! 左侧
// const prevChildren = [
//     h('p', { key: 'A' }, 'A'),
//     h('p', { key: 'B' }, 'B'),
// ]
// const nextChildren = [
//     h('p', { key: 'D' }, 'D'),
//     h('p', { key: 'C' }, 'C'),
//     h('p', { key: 'A' }, 'A'),
//     h('p', { key: 'B' }, 'B'),
// ]

// 旧的比新的多，需要删除
//! 删除右侧
// const prevChildren = [
//     h('p', { key: 'A' }, 'A'),
//     h('p', { key: 'B' }, 'B'),
//     h('p', { key: 'C' }, 'C'),
// ]
// const nextChildren = [
//     h('p', { key: 'A' }, 'A'),
//     h('p', { key: 'B' }, 'B'),
// ]

//! 删除左侧
// const prevChildren = [
//     h('p', { key: 'A' }, 'A'),
//     h('p', { key: 'B' }, 'B'),
//     h('p', { key: 'C' }, 'C'),
// ]
// const nextChildren = [
//     h('p', { key: 'B' }, 'B'),
//     h('p', { key: 'C' }, 'C'),
// ]


const prevChildren = [
    h('p', { key: 'A' }, 'A'),
    h('p', { key: 'B' }, 'B'),
    h('p', { key: 'D' }, 'D'),
    h('p', { key: 'E' }, 'E'),
    h('p', { key: 'C' }, 'C'),
    h('p', { key: 'M' }, 'M'),
    h('p', { key: 'F' }, 'F'),
    h('p', { key: 'G' }, 'G'),
]
const nextChildren = [
    h('p', { key: 'A' }, 'A'),
    h('p', { key: 'B' }, 'B'),
    h('p', { key: 'E' }, 'E'),
    h('p', { key: 'C', id: 'new-c' }, 'C'),
    h('p', { key: 'D' }, 'D'),
    h('p', { key: 'H' }, 'H'),
    h('p', { key: 'F' }, 'F'),
    h('p', { key: 'G' }, 'G'),
]

export default {
    setup() {
        let flag = ref(false)
        window.flag = flag
        return {
            flag
        }
    },
    render() {

        return h('div', {}, this.flag ? nextChildren : prevChildren)
    }
}