# Calculadora de gastos — arquitectura en dos capas

Aplicación web simple para registrar gastos, consultar el total acumulado, calcular el promedio e identificar la categoría con mayor consumo. El código separa la **capa de presentación** de la **capa de lógica**.

## Cómo ejecutar

1. Descomprime la carpeta si recibiste el archivo `.zip`.
2. Abre `index.html` con Chrome, Edge o Firefox.
3. Registra uno o más gastos y revisa cómo se actualiza el resumen.

No se necesita instalar dependencias ni iniciar un servidor.

## Las dos capas

### 1. Presentación — `js/presentacion.js`

- Lee los datos del formulario.
- Crea una solicitud como `{ tipo: "AGREGAR_GASTO", datos }`.
- Envía esa solicitud a la lógica.
- Recibe la respuesta y actualiza el HTML.
- No realiza cálculos de totales.

### 2. Lógica — `js/logica-gastos.js`

- Recibe la solicitud mediante `procesarSolicitud()`.
- Valida la descripción, la categoría y el monto.
- Guarda temporalmente el gasto en memoria.
- Calcula total, cantidad, promedio y categoría principal.
- Devuelve una respuesta a la capa de presentación.
- No conoce ni modifica elementos HTML.

## Flujo de una petición

```text
Usuario
   ↓ completa y envía el formulario
Capa UI: presentacion.js
   ↓ procesarSolicitud({ tipo, datos })
Capa lógica: logica-gastos.js
   ↓ { exito, mensaje, datos: { gastos, resumen } }
Capa UI: actualiza el resumen y la lista
```

Los dos elementos que interactúan son:

1. La función de la UI que captura el evento del formulario.
2. El objeto `CalculadoraGastos`, que procesa la solicitud y devuelve la respuesta.

## Funciones incluidas

- Registrar y validar gastos.
- Calcular total, promedio y categoría principal.
- Eliminar un gasto.
- Limpiar todos los gastos.
- Visualizar en tiempo real el recorrido de cada petición.
- Diseño adaptable a computadora y celular.

## Pruebas automáticas (opcional)

Si tienes Node.js instalado, ejecuta:

```bash
npm test
```

Las pruebas verifican la lógica sin depender de la interfaz.

## Estructura

```text
calculadora-gastos/
├── index.html                  # Estructura de la UI
├── css/
│   └── estilos.css             # Diseño visual
├── js/
│   ├── presentacion.js         # Capa de presentación
│   └── logica-gastos.js        # Capa de lógica
├── tests/
│   └── logica-gastos.test.js   # Pruebas de la lógica
├── GUIA_PRESENTACION.md        # Guion breve para exponer
└── README.md
```
