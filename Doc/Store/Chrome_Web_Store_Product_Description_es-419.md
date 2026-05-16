AI Usage Dashboard reúne cuotas de herramientas de IA para código, bloqueos de configuración y estado de sincronización en un popup de la barra de Chrome y un panel lateral.

Está pensado para flujos con Codex, Cursor, Claude Code, Gemini Code Assist y herramientas similares, donde los datos del provider pueden ser exactos, parciales, por ventana de uso o solo de política. La extensión muestra esos límites en vez de fingir que todos los providers exponen el mismo número.

Puedes revisar:

• estado del provider y bloqueos de configuración
• ventanas de uso y horas de reinicio cuando el provider las expone
• tipo de fuente: API, página con sesión iniciada, contexto parcial de página o política documentada
• frescura del snapshot y estado de sincronización
• badge/icono de la barra, temas, estilos de progreso, orden de providers e importación/exportación de configuración

AI Usage Dashboard usa límites de datos conservadores. No te pide pegar cookies ni headers de autenticación del navegador. Guarda configuración, credenciales API opcionales, vínculos de páginas, snapshots en caché y archivos JSON de importación/exportación en tu perfil de Chrome. Los permisos opcionales de host solo se usan para orígenes de providers compatibles. El permiso favicon se usa para la función opcional de icono de barra que coincide con el provider.

Este no es un producto oficial de OpenAI, Cursor, Anthropic, Google, JetBrains ni de ningún otro provider. Los providers pueden cambiar dashboards, APIs, textos de cuota y políticas. Si una fuente no está disponible o solo entrega información parcial, el dashboard muestra ese estado en vez de inventar un valor.

El proyecto es de código abierto bajo AGPL-3.0-only.
