# diagramFlow

**diagramFlow** es una aplicación interactiva basada en Vue 3 que permite construir diagramas de flujo dinámicos y personalizados. Está diseñada para facilitar la creación, edición y conexión de nodos en un lienzo usando VueFlow junto con Quasar para la interfaz de usuario.

---

## 📂 Estructura del proyecto

```
src/
├─ components/
│  ├─ FlowBoard/
│  │  ├─ FlowBoard.vue       # Componente principal: integra lienzo y sidebar
│  │  ├─ useFlowBoard.ts      # Composable con la lógica de creación, edición y conexión de nodos
│  │  ├─ FlowCanvas.vue       # Wrapper de VueFlow para renderizar nodos y aristas
│  │  └─ Sidebar.vue          # Drawer para agregar, editar y eliminar nodos
│  └─ Nodes/                  # Componentes de presentación de cada tipo de nodo
│     ├─ AddNode.vue          # Nodo “+” (add)
│     ├─ NodeSimpleStep.vue   # Paso simple
│     ├─ NodeBranch.vue       # Nodo de bifurcación (branch)
│     ├─ NodeBranchChild.vue  # Ramas hijas de branch
│     └─ NodeGoto.vue         # Nodo GoTo
└─ App.vue                   # Punto de entrada de la app
```

---

## ⚙️ Instalación y ejecución

1. Clona el repositorio y ve al directorio del proyecto:
   ```bash
   git clone <URL-del-repo>
   cd diagramFlow
   ```
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Ejecuta en modo desarrollo:
   ```bash
   npm run dev
   ```
4. Abre [http://localhost:3000](http://localhost:3000) (o el puerto indicado) en tu navegador.

---

## 🚀 Funcionalidades principales

### 1. Añadir nodos

- Al hacer clic en el botón **+** dentro del lienzo, se abre el **Sidebar**.
- Puedes elegir entre:
  - **Paso simple**: nodo editable con etiqueta.
  - **Bifurcación (Branch)**: crea un nodo padre con dos nodos hijos.
  - **GoTo**: nodo que se conecta dinámicamente a un padre existente.

### 2. Conexión GoTo

1. Selecciona **Paso ir a** en el Sidebar.
2. El nodo GoTo aparece y **entra en modo conexión**.
3. Los nodos válidos parpadean para indicar que son objetivos.
4. Haz clic en uno de ellos para:
   - Dibujar una arista punteada animada (**dashed edge**).
   - Asignar al nodo GoTo el icono correspondiente (simple o branch).

### 3. Edición de nodos

- Haz clic en cualquier nodo de tipo **simple-step**, **branch** o **branch-child**.
- Se abre el Sidebar con campos de texto:
  - Para **branch**, permite editar la etiqueta principal y las dos ramas hijas.
  - Para **simple-step** y **branch-child**, solo la etiqueta.
- Confirma para guardar los cambios en el lienzo.

### 4. Eliminación de nodos

- Desde el Sidebar, pulsa **Eliminar**.
- El composable `useFlowBoard` se encarga de:
  - Borrar nodos dependientes (hijos, botones *add*, nodos *end*).
  - Ajustar posiciones y reconstruir aristas automáticamente.

---

## 📝 Detalles de implementación (`useFlowBoard.ts`)

- **Estados Reactivos**:

  - `nodes`: lista de nodos del diagrama.
  - `edges`: lista de aristas entre nodos.
  - `sidebarOpen`, `editingNode`, etiquetas locales, etc.
  - `gotoMode`: controla el modo de conexión GoTo.

- **Funciones clave**:

  - `rebuildEdges()`: recalcula todas las aristas según posiciones y tipos.
  - `onNodeClick(event)`: maneja clics en nodos:
    1. Activa modo GoTo y pulsa objetivos.
    2. Conecta nodos cuando se confirma la arista.
    3. Abre Sidebar para agregar o editar nodos.
  - `addSimpleNode()`, `addBranchNode()`, `addGotoNode()`: lógica de inserción y reposicionamiento.
  - `saveEdit()`: guarda etiquetas en nodos existentes.
  - `deleteNode()`: elimina nodos y ajusta el diagrama.

---

## 🎨 Estilos y animaciones

- **Lienzo** con fondo cuadriculado CSS.
- \*\*Animación \*\*\`\` para aristas punteadas animadas.
- **Pulsación** de nodos objetivo en modo GoTo usando `pulsing` en datos del nodo.

---

> Documentación generada automáticamente por ChatGPT para `diagramFlow`.

