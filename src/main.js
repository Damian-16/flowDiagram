import "./assets/main.css";
import { createApp } from "vue";
import App from "./App.vue";
import { Quasar } from "quasar";
import "./assets/main.css"; // o './style.scss', según hayas elegido

// Opcional: iconos
import "@quasar/extras/material-icons/material-icons.css";
// Estilos principales de Quasar
import "quasar/src/css/index.sass";

const app = createApp(App);
app.use(Quasar, {
  plugins: {}, // aquí añades plugins de Quasar si los usas
});
app.mount("#app");
