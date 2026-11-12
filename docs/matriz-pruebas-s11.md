# Sesión 11 - matriz de pruebas

**Proyecto:** PharmaSoft SPA  
**Rama:** `feature/seguridad-frontend-suarez`  
**Fecha de verificación:** 22/10/2026  
**Base:** implementación S9 conservada en la rama.

| N.º | Prueba de la guía | Resultado | Descripción breve |
|---:|---|---|---|
| 1 | Ruta protegida sin sesión | Verificada | Al abrir `/ventas`, la SPA redirigió al login y conservó `returnUrl=/ventas`. |
| 2 | Envío de login vacío | Verificada | El formulario mostró validaciones locales para usuario y contraseña. |
| 3 | Admin con contraseña incorrecta | Verificada | Permaneció en login y mostró el mensaje genérico «Usuario o contraseña incorrectos». |
| 4 | Acceso de usuario inactivo | Pendiente | El mensaje genérico apareció, pero las credenciales de prueba no permiten distinguir contraseña incorrecta de cuenta deshabilitada. |
| 5 | Login vendedor y retorno a Ventas | Pendiente | `vendedor / Vendedor2026*` no autenticó en la base local actual. Se requiere confirmar la clave vigente. |
| 6 | Token Bearer en solicitudes | Verificada | Tras login válido de almacén, la SPA consultó `/productos` y recibió datos del backend protegido. |
| 7 | Sesión en `sessionStorage` | Verificada en código | `AuthService` guarda `pharmasoft.sesion`, token, permisos y vencimiento; falta captura del panel Aplicación. |
| 8 | Recargar página con sesión | Verificada | Tras F5 en `/productos`, la sesión de almacén se mantuvo y la lista volvió a cargar. |
| 9 | Vendedor sin acciones de escritura | Pendiente | Requiere una sesión vendedor válida para comprobar botones y columna Acciones. |
| 10 | Vendedor abre `/productos/nuevo` | Pendiente | Requiere una sesión vendedor válida para comprobar el bloqueo de permiso. |
| 11 | Usuario autenticado abre `/login` | Verificada | La ruta redirigió a `/inicio` con la sesión vigente. |
| 12 | Cerrar sesión | Verificada | El botón cerró la sesión y devolvió al formulario de login; el servicio elimina la clave de sesión. |
| 13 | Almacenero abre `/ventas` | Verificada | La opción Ventas no apareció en el menú y la URL directa devolvió «Acceso denegado». |
| 14 | Supervisor y edición de catálogo | Verificada | El supervisor vio Ventas, Nuevo producto, Editar y Dar de baja. |
| 15 | Token alterado | Pendiente | Falta alterar el token en almacenamiento y documentar el 401/retorno al login. |
| 16 | Expiración de un minuto | Verificada | Con JWT de 60 segundos, la SPA cerró sesión automáticamente, mostró el aviso de expiración y conservó `/ventas` para el retorno. El backend volvió luego a su configuración normal de 60 minutos. |

## Estado de entrega

La implementación compila y los flujos principales de admin, almacén y supervisor se verificaron en la SPA local. La matriz deja visibles las pruebas que dependen de una clave vendedor vigente o de manipular temporalmente el token. No se registran resultados ni capturas para esas pruebas pendientes.

**Compilación:** `ng build` completó correctamente el 22/10/2026.
