AI Usage Dashboard es una pequeña cabina para cuotas de herramientas de IA para código, bloqueos de configuración y salud de sincronización.

Abre el popup de la barra de Chrome para mirar rápido; abre el panel lateral o el dashboard completo cuando necesites detalles. Menos pestañas perdidas, más tiempo escribiendo código. (^_^)

Funciona con flujos como Codex, Cursor, Claude Personal, analíticas de organización de Claude Code, Gemini Code Assist y gateways compatibles con Sub2API configurados por el usuario, y muestra con claridad si cada fuente es exacta, parcial, por ventana de uso, solo de política o no disponible.

No te pide pegar cookies ni headers brutos de autenticación del navegador. La configuración, credenciales API opcionales, vínculos de páginas, snapshots en caché, archivos de importación/exportación y datos de Chrome Sync se quedan en tu perfil de Chrome.

Qué te ayuda a ver

• salud del provider y bloqueos de configuración
• ventanas de uso restantes y horas de reinicio cuando el provider las expone
• tipo de fuente: API, página con sesión iniciada, contexto parcial de página, política documentada o fuente no disponible
• frescura del snapshot y estado de sincronización
• comportamiento del badge y del icono de la barra
• fuentes JSON HTTP/HTTPS personalizadas para tus propios endpoints de cuota
• saldo, gasto, solicitudes, tokens, modelos, tendencias y límites agregados que devuelven gateways compatibles con Sub2API configurados
• bandas de progreso tradicionales o visualización de color restante con gradiente editable
• idioma, tema, apariencia del popup, estilo de progreso, orden de providers e importación/exportación

Cómo se siente en el uso diario

Los asistentes de IA para código son rápidos y útiles, pero las páginas de cuota y el estado de la cuenta pueden volverse confusos. Un momento todo funciona; al siguiente aparece una ventana de cuota, falta un permiso, caducó la sesión o cambió la política de algún provider.

AI Usage Dashboard intenta volver eso menos misterioso. Te da un lugar tranquilo para mirar el estado actual y entrar al detalle solo cuando hace falta. Un tablero pequeño, no otro proyecto que administrar. ✨

La cobertura de providers es intencionalmente honesta

Cada provider expone datos distintos:

• algunas rutas muestran ventanas de uso en vivo o casi en vivo
• algunas rutas solo muestran contexto parcial de una página
• algunas rutas son solo de política en esta versión
• algunos providers requieren una página con sesión iniciada, host access opcional o credenciales API
• en el primer uso, si el bloqueo es el permiso de host, la tarjeta del Provider muestra una acción enfocada de “Conceder acceso”
• los dashboards, APIs, textos de cuota y políticas de los providers pueden cambiar

Cuando una fuente no está disponible o es parcial, la extensión muestra ese estado en vez de inventar un número.

Privacidad y permisos

AI Usage Dashboard está diseñado de forma conservadora:

• no pega cookies
• no pega headers brutos de autenticación del navegador
• permisos opcionales de host solo para orígenes de providers compatibles
• las fuentes JSON personalizadas consultan endpoints HTTP o HTTPS aprobados por el usuario, sin credenciales del navegador
• las claves API de Sub2API solo se envían al origen exacto del gateway configurado; no se importan registros de solicitudes individuales
• permiso favicon solo para la función opcional de icono de barra combinado con el provider
• los gradientes generados desde una imagen local se procesan en tu navegador; los bytes originales no se suben ni se guardan
• solo ejecuta scripts empaquetados; no carga código remoto
• la configuración y los datos en caché se quedan en tu perfil de Chrome salvo que los exportes

Este no es un producto oficial de OpenAI, Cursor, Anthropic, Google, JetBrains ni de ningún otro provider.

Código abierto

El proyecto es de código abierto bajo AGPL-3.0-only:
https://github.com/David-Lzy/AI_Usage_Dashboard
