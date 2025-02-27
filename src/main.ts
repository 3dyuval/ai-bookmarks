import { createApp } from 'vue'
import './style.scss'
import App from './app.vue'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { VTreeview } from 'vuetify/labs/VTreeview'
import { aliases, md } from 'vuetify/iconsets/md'


const vuetify = createVuetify({
    icons: {
        defaultSet: 'md',
        aliases,
        sets: {
            md,
        },
    },
    components: {
        VTreeview,
    },
})

const app = createApp(App)

app.use(vuetify)
app.mount('#app')
