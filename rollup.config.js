import typescript from '@rollup/plugin-typescript'
// import pkg from './package.json'
export default {
    input: './packages/vue/src/index.ts',
    output: [
        {
            format: 'cjs',
            // file: pkg.main
            file: './packages/vue/dist/cone-mini-vue.cjs.js'
        },
        {
            format: 'es',
            // file: pkg.module
            file: './packages/vue/dist/cone-mini-vue.esm.js'
        }
    ],
    plugins: [
        typescript()
    ]
}