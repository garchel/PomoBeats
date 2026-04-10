# PomoBeats

PomoBeats e um app desktop-first para montar sessoes de estudo personalizadas com blocos de foco e pausa em qualquer sequencia.

## O que ja funciona

- criar uma sessao com titulo e uma sequencia customizada de intervalos
- alternar entre blocos de `pomo` e `break`
- salvar sessoes localmente
- listar, carregar e excluir sessoes salvas
- exportar a sessao atual em JSON
- importar uma sessao JSON com tratamento de conflito por sufixo no titulo
- executar a sessao no player com contagem regressiva
- avancar automaticamente ou pausar no proximo intervalo conforme as configuracoes
- persistir configuracoes no Electron store

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Electron

## Como rodar

```bash
npm install
npm run dev
```

Para rodar a interface com Electron em desenvolvimento:

```bash
npm start
```

## Fluxo principal do produto

1. Monte a sessao na tela principal adicionando os periodos desejados.
2. Salve a sessao para reutilizar depois.
3. Exporte a sessao atual se quiser compartilhar ou fazer backup.
4. Importe uma sessao pela tela de sessoes salvas.
5. Inicie o player e acompanhe a sequencia completa dos intervalos.

## Persistencia atual

- sessoes: `localStorage`
- configuracoes: `electron-store`

Essa divisao e intencional para a primeira versao estavel. Depois que o fluxo principal estiver consolidado, a migracao das sessoes para Electron-backed storage deve ser reavaliada.

## Proximos passos

- revisar a migracao planejada das sessoes para Electron
- evoluir a UX do player concluido
- melhorar importacao/exportacao com mais feedback visual
- adicionar testes automatizados para o fluxo principal
