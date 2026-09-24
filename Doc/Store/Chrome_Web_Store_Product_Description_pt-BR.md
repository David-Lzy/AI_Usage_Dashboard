Veja as cotas de IA para programação antes que interrompam seu trabalho. AI Usage Dashboard reúne limites visíveis na fonte, horários de reset, gastos e estado de sincronização em uma extensão do Chrome.

Use o popup da barra para conferir rapidamente e o painel lateral ou dashboard completo para detalhes. O Quick Setup aparece primeiro nas Configurações para conectar apenas as fontes que você usa.

Ele funciona com fluxos como Codex, Cursor, Claude Personal, análises organizacionais do Claude Code, Gemini Code Assist e gateways compatíveis com Sub2API configurados pelo usuário, mostrando claramente se cada fonte é exata, parcial, por janela de uso, apenas de política ou indisponível.

Ele não pede cookies nem headers brutos de autenticação do navegador. Configurações, credenciais API opcionais, vínculos de páginas, snapshots em cache, arquivos de importação/exportação e dados do Chrome Sync ficam no seu perfil do Chrome.

O que ele ajuda você a ver

• saúde do provider e bloqueios de configuração
• janelas de uso restantes e horários de reset quando o provider expõe esses dados
• tipo de fonte: API, página com login, contexto parcial de página, política documentada ou fonte indisponível
• frescor do snapshot e estado de sincronização
• notificações opcionais de cota/reset, com limiares separados para alertas no app e do sistema
• resumos por período, exportação CSV segura de agregados e relatório de diagnóstico sem dados sensíveis
• comparação de implantações Sub2API salvas quando período, unidade e moeda permitem
• leitura opcional de cotas pelo Codex CLI Companion, pareado manualmente no mesmo computador; estimativas equivalentes à API não são cobranças nem saldo
• comportamento do badge e do ícone da barra
• fontes JSON HTTP/HTTPS personalizadas para seus próprios endpoints de cota
• saldo, gasto, solicitações, tokens, modelos, tendências e limites agregados retornados por gateways compatíveis com Sub2API configurados
• faixas tradicionais de progresso ou exibição de cor restante com gradiente editável
• idioma, tema, aparência do popup, estilo de progresso, ordem de providers e importação/exportação

Como ele funciona no dia a dia

Assistentes de IA para programação são rápidos e úteis, mas páginas de cota e estados de conta podem ficar confusos. Em um momento tudo funciona; no próximo aparece uma janela de cota, falta uma permissão, a sessão expira ou a política de algum provider muda.

AI Usage Dashboard facilita a leitura desses estados e distingue dados desconhecidos ou antigos de valores recentes da fonte.

A cobertura dos providers é propositalmente honesta

Cada provider expõe tipos diferentes de informação:

• alguns caminhos mostram janelas de uso ao vivo ou quase ao vivo
• alguns caminhos mostram apenas contexto parcial de página
• alguns caminhos são apenas de política nesta versão
• alguns providers exigem página com login, host access opcional ou credenciais API
• no primeiro uso, se o bloqueio for permissão de host, o cartão do Provider mostra uma ação focada de “Conceder acesso”
• dashboards, APIs, textos de cota e políticas dos providers podem mudar

Quando uma fonte está indisponível ou é parcial, a extensão mostra esse estado em vez de inventar um número.

Privacidade e permissões

AI Usage Dashboard foi desenhado de forma conservadora:

• não pede cookies
• não pede headers brutos de autenticação do navegador
• permissões opcionais de host apenas para origens de providers compatíveis
• fontes JSON personalizadas consultam endpoints HTTP ou HTTPS aprovados pelo usuário, sem credenciais do navegador
• chaves API do Sub2API são enviadas somente à origem exata do gateway configurado; registros de solicitações individuais não são importados
• permissão favicon apenas para o recurso opcional de ícone da barra combinado com o provider
• gradientes gerados de uma imagem local são processados no navegador; os bytes originais não são enviados nem salvos
• executa apenas scripts empacotados; não carrega código remoto
• configurações e dados em cache ficam no seu perfil do Chrome, a menos que você os exporte
• o Companion do Codex só funciona após iniciar e parear manualmente no mesmo computador; a extensão não o instala nem inicia

Este não é um produto oficial da OpenAI, Cursor, Anthropic, Google, JetBrains ou de qualquer outro provider.

Código aberto

O projeto é open source sob AGPL-3.0-only:
https://github.com/David-Lzy/AI_Usage_Dashboard
