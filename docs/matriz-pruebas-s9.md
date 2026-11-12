# Matriz de pruebas de ventas — Sesión 9, actividad autónoma

**Estudiante:** Jatniel Suárez

**Rama:** `feature/pruebas-reporte-ventas-suarez`
**Uso:** completar «Resultado obtenido», «Estado» y confirmar la captura en «Evidencia» después de ejecutar cada caso. Los resultados no se rellenan por anticipado.

| ID | Grupo | Precondición | Datos | Resultado esperado (cálculo manual cuando aplica) | Resultado obtenido | Estado (Pasa/Falla) | Evidencia |
|---|---|---|---|---|---|---|---|
| B-01 | Buscadores | Existe un cliente inactivo y otro activo. | Buscar DNI del inactivo; después apellido del activo sin tilde. | El inactivo no aparece; el activo sí aparece al buscar sin tilde. | Pendiente de ejecutar. |  | `evidencias-autonoma/B-01_spa.png` |
| B-02 | Buscadores | Hay productos activos con stock y categoría asignada. | Buscar parte del nombre; buscar nombre de categoría; pulsar Enter. | Solo aparecen coincidencias activas con stock; Enter agrega el primer resultado sin abrir el resumen. | Pendiente de ejecutar. |  | `evidencias-autonoma/B-02_spa.png` |
| C-01 | Cálculos | Producto activo cuesta S/ 12.50. | Una línea, cantidad 3. | S/ 12.50 × 3 = **S/ 37.50**; subtotal y total son S/ 37.50. | Pendiente de ejecutar. |  | `evidencias-autonoma/C-01_spa.png` |
| C-02 | Cálculos | Producto activo cuesta S/ 18.90. | Una línea, cantidad 3. | S/ 18.90 × 3 = **S/ 56.70** exactos, redondeados a dos decimales. | Pendiente de ejecutar. |  | `evidencias-autonoma/C-02_spa.png` |
| C-03 | Cálculos | Tres productos activos disponibles. | Amoxicilina S/ 18.00 ×1, Ibuprofeno S/ 15.00 ×2, Azitromicina S/ 22.50 ×1; quitar Ibuprofeno. | Inicial: 18.00 + 30.00 + 22.50 = **S/ 70.50**. Tras quitar la línea del medio: 18.00 + 22.50 = **S/ 40.50**. | Pendiente de ejecutar. |  | `evidencias-autonoma/C-03_spa.png` |
| C-04 | Cálculos | Venta configurada como C-03 después de quitar la línea del medio. | Registrar y comparar el comprobante. | Total del servidor **S/ 40.50**, igual al total estimado; diferencia = S/ 0.00. | Pendiente de ejecutar. |  | `evidencias-autonoma/C-04_spa.png` |
| V-01 | Validaciones | Formulario nuevo vacío. | Pulsar «Revisar venta» sin elegir cliente ni productos. | Mensajes de validación en cliente y detalle vacío; no aparece el resumen y no se envía POST. | Pendiente de ejecutar. |  | `evidencias-autonoma/V-01_spa.png` |
| V-02 | Validaciones | Producto disponible en el formulario. | Probar cantidad 0 y luego 2.5. | Ambos valores se rechazan con mensaje de entero mayor que cero; no se puede revisar la venta. | Pendiente de ejecutar. |  | `evidencias-autonoma/V-02_spa.png` |
| V-03 | Validaciones | Producto de prueba tiene stock exactamente 2. | Cantidad 3. | Se muestra «Supera el stock (2)» y se bloquea la revisión. | Pendiente de ejecutar. |  | `evidencias-autonoma/V-03_spa.png` |
| V-04 | Validaciones | Producto ya está agregado con cantidad n. | Agregar el mismo producto otra vez desde el buscador. | Indica «En la venta: n»; la línea existente cambia a n + 1 y no se duplica. | Pendiente de ejecutar. |  | `evidencias-autonoma/V-04_spa.png` |
| V-05 | Validaciones | API disponible; producto y cliente activos. | Postman: enviar el mismo `productoId` en dos detalles de una venta. | Regla esperada: API rechaza duplicidad con 400 y no registra ni descuenta stock. Contrastar con respuesta real. | Pendiente de ejecutar. |  | `evidencias-autonoma/V-05_postman.png` |
| F-01 | Confirmación | Formulario válido; Network limpio y grabando. | Revisar y pulsar «Volver». | Se cierra el resumen y conserva el formulario; Network no registra POST de creación. | Pendiente de ejecutar. |  | `evidencias-autonoma/F-01_red.png` |
| F-02 | Confirmación | Formulario válido listo para confirmar. | Pulsar «Confirmar venta» dos veces rápidamente. | Se registra una sola venta; el botón queda deshabilitado durante la petición. | Pendiente de ejecutar. |  | `evidencias-autonoma/F-02_red.png` |
| M-01 | Mensajes | Producto de prueba tiene stock 2; dos pestañas preparadas antes de confirmar. | En ambas, vender 2 unidades; confirmar la primera y luego la segunda. | Primera registra; segunda recibe 409 con mensaje de stock, queda editable y no crea venta parcial. | Pendiente de ejecutar. |  | `evidencias-autonoma/M-01_red.png` |
| M-02 | Mensajes | Cliente inactivo y producto activo; API disponible. | Postman: POST venta para el cliente inactivo. | HTTP 409 con «No se puede registrar una venta para un cliente inactivo»; no se descuenta stock. | Pendiente de ejecutar. |  | `evidencias-autonoma/M-02_postman.png` |
| I-01 | Impresión | Hay venta registrada y anulada, con cliente con DNI; consulta con filtros aplicados. | Imprimir al registrar, desde botón de venta anulada y desde consulta filtrada; guardar cada PDF. | Sin controles dentro de la hoja; comprobante incluye DNI y pie; anulada incluye sello; consulta muestra filtros. | Pendiente de ejecutar. |  | `evidencias-autonoma/I-01_comprobantes.png` |
| X-01 | Consistencia | Se registra una venta para producto con stock conocido. | Revisar Productos y luego la consulta de ventas. | Stock final = stock inicial − unidades vendidas; la venta muestra el mismo total e ítems del comprobante. | Pendiente de ejecutar. |  | `evidencias-autonoma/X-01_consistencia.png` |
| B-03 | Buscadores (propio) | Existe categoría con varios productos activos, más de uno con stock. | Buscar por texto exacto de la categoría y recorrer sugerencias con teclado. | La búsqueda por categoría devuelve solo sus productos activos disponibles y permite elegir el resultado enfocado. | Pendiente de ejecutar. |  | `evidencias-autonoma/B-03_spa.png` |
| C-05 | Cálculos (propio) | Hay dos productos con precios decimales disponibles. | Producto A S/ 18.90 ×2 y producto B S/ 12.35 ×3. | A: 18.90 × 2 = 37.80; B: 12.35 × 3 = 37.05; total = 37.80 + 37.05 = **S/ 74.85**. | Pendiente de ejecutar. |  | `evidencias-autonoma/C-05_spa.png` |
| V-06 | Validaciones (propio) | API disponible; IDs válidos de cliente y producto. | Postman: enviar detalle con cantidad decimal 2.5. | API rechaza el cuerpo (4xx de validación/deserialización); no crea venta ni modifica stock. | Pendiente de ejecutar. |  | `evidencias-autonoma/V-06_postman.png` |
| F-03 | Confirmación (propio) | Formulario válido con imprimir desmarcado. | Confirmar venta y observar navegación. | Se crea exactamente una venta y se muestra su detalle; no abre diálogo de impresión. | Pendiente de ejecutar. |  | `evidencias-autonoma/F-03_red.png` |

## Registro de ejecución

Completar las celdas pendientes con el resultado observado, código HTTP y evidencia real. No marcar «Pasa» cuando solo se haya previsto el resultado. Los cálculos esperados están hechos a mano y sirven para contrastar el redondeo a dos decimales.
