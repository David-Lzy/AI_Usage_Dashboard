AI Usage Dashboard reúne cotas de ferramentas de IA para programação, bloqueios de configuração e saúde de sincronização em um popup da barra do Chrome e em um painel lateral.

Ele foi feito para fluxos com Codex, Cursor, Claude Code, Gemini Code Assist e ferramentas relacionadas, onde os dados de cada provider podem ser exatos, parciais, por janela de uso ou apenas baseados em política. A extensão mantém esses limites visíveis em vez de fingir que todos os providers expõem o mesmo número.

Você pode verificar:

• saúde do provider e bloqueios de configuração
• janelas de uso e horários de reset quando o provider expõe esses dados
• tipo de fonte: API, página com login, contexto parcial de página ou política documentada
• frescor do snapshot e estado de sincronização
• badge/ícone da barra, temas, estilos de progresso, ordem de providers e importação/exportação de configurações

AI Usage Dashboard usa limites de dados conservadores. Ele não pede cookies nem headers brutos de autenticação do navegador. Configurações, credenciais API opcionais, vínculos de página, snapshots em cache e arquivos JSON de importação/exportação ficam no seu perfil do Chrome. Permissões opcionais de host são usadas apenas para origens de providers compatíveis. A permissão favicon é usada para o recurso opcional de ícone da barra combinado com o provider.

Este não é um produto oficial da OpenAI, Cursor, Anthropic, Google, JetBrains ou de qualquer outro provider. Providers podem mudar dashboards, APIs, textos de cota e políticas. Quando uma fonte está indisponível ou fornece apenas dados parciais, o dashboard mostra esse estado em vez de inventar um valor.

O projeto é de código aberto sob AGPL-3.0-only.
