export const App = {
    render(h) {
        return h('div', 'hello,my name is ' + this.name)
    }
    setup() {
        return {
            name: 'cone41'
        }
    }
}