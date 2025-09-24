# Calculadora Científica (Web)

Breve descripción de funcionalidades implementadas:

- Campo informativo: `h2#info` que se actualiza tras cada operación con mensajes según el rango del resultado y el tipo de operación (incluye mensajes especiales para CSV).
- Operaciones unitarias: módulo (±), factorial (n!), cuadrado (x²), cubo (x³), raíz cuadrada (√x), potencia a n (xⁿ con segundo campo para exponente).
- Operaciones binarias: suma (+) y multiplicación (×) con estado global del primer operando y cálculo al presionar `=`.
- Operaciones CSV: sumatorio, ordenar, revertir, quitar último, media y quitar un valor específico de la lista. Validación de listas vacías o con valores inválidos.
- Validación y errores: soporte para enteros, decimales (±) y listas CSV; mensajes de error específicos en pantalla y registro de errores en memoria.
- Logs descargables: botón para descargar un `.json` con el historial de errores.
- Gráficos: lienzo (canvas) para graficar series CSV y funciones `sin(x)`, `cos(x)` y `x^2`.
- Estilo y UX: diseño responsivo, resaltado del último botón presionado, animación de carga para operaciones de CSV.
- Accesibilidad y atajos: navegación por teclado y atajos (números, `.`/`,`, `Backspace`, `Esc`, `+`, `*`, `Enter`, y letras: `s`=√, `m`=módulo, `f`=factorial).

Cómo ejecutar:

1. Abrir `index.html` en un navegador moderno.
2. Ingresar números en el campo principal y listas en `csv-input` (ej.: `1, 2, 3.5, -2`).
3. Usar los botones o atajos para operar y el botón “Graficar” para visualizar en el canvas.
