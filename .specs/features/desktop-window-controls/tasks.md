# Desktop Window Controls Tasks

**Design**: `.specs/features/desktop-window-controls/design.md`
**Status**: Draft

---

## Execution Plan

### Phase 1: Foundation

`T1 -> T2 -> T3`

### Phase 2: Desktop Behaviors

`T3 -> T4 -> T5`

### Phase 3: Background Presence

`T5 -> T6`

---

## Task Breakdown

### T1: Expandir schema de settings e tipos de janela

**What**: Adicionar ao estado persistido os campos de opacidade, click-through, tray e
hotkeys, mantendo tipagem coerente entre Electron, preload e renderer.
**Where**:

- `public/electron.js`
- `src/types/pomo.ts`
- `src/types/global.d.ts`
- `src/context/PomoContext.tsx`

**Depends on**: None
**Reuses**:

- defaults atuais de `settings`
- padrão de `updateSettings`

**Requirement**: DWC-03, DWC-04, DWC-05, DWC-06

**Done when**:

- [ ] `SettingsState` cobre todos os novos controles desktop
- [ ] Electron store inicializa defaults válidos
- [ ] Renderer consegue ler e persistir os novos campos sem quebrar settings existentes

**Tests**: unit
**Gate**: `npm test`

---

### T2: Criar APIs de controle de janela no processo principal e preload

**What**: Introduzir handlers IPC e bridge para foco da janela, opacidade, click-through,
minimização e leitura de estado básico da shell.
**Where**:

- `public/electron.js`
- `public/preload.js`
- `src/types/global.d.ts`

**Depends on**: T1
**Reuses**:

- padrão atual de `ipcMain.handle`
- `window.electron`

**Requirement**: DWC-03, DWC-04, DWC-05

**Done when**:

- [ ] Renderer consegue chamar comandos explícitos de janela pelo preload
- [ ] Opacidade e foco funcionam sem acesso direto ao Electron no renderer
- [ ] Existe base pronta para a title bar e para a tela de settings

**Tests**: unit
**Gate**: `npm test`

---

### T3: Ajustar a shell visual para tamanho real da janela e title bar customizada

**What**: Remover o card interno que simula moldura, tornar a UI o conteúdo real da
janela e adicionar uma barra customizada com área dragável e ações mínimas.
**Where**:

- `public/electron.js`
- `src/MainScreen.tsx`
- `src/components/Header.tsx` ou novo `src/components/TitleBar.tsx`
- estilos associados em `src/App.css` e/ou `src/index.css`

**Depends on**: T2
**Reuses**:

- branding atual do header
- layout principal já existente

**Requirement**: DWC-01, DWC-02

**Done when**:

- [ ] `BrowserWindow` usa frame customizado
- [ ] A interface ocupa a área útil da janela sem moldura falsa interna
- [ ] Existe controle de minimizar/fechar e área dragável funcional

**Tests**: unit + manual Electron smoke test
**Gate**: `npm test` e validação manual em `npm start`

---

### T4: Implementar configuração de opacidade no renderer e aplicação em tempo real

**What**: Adicionar controles de opacidade nas configurações e aplicar o valor
imediatamente na janela com persistência.
**Where**:

- `src/components/SettingsPanel.tsx`
- `src/context/PomoContext.tsx`
- `public/electron.js`

**Depends on**: T3
**Reuses**:

- `RangeRow`
- fluxo de persistência de settings

**Requirement**: DWC-03

**Done when**:

- [ ] O usuário consegue ajustar a opacidade pela UI
- [ ] O valor é normalizado para faixa segura
- [ ] Reiniciar o app mantém a opacidade configurada

**Tests**: unit + manual Electron smoke test
**Gate**: `npm test` e validação manual em `npm start`

---

### T5: Registrar hotkeys globais para click-through e foco da janela

**What**: Registrar e manter atalhos globais para alternar click-through e restaurar a
janela, incluindo re-registro quando as preferências mudarem.
**Where**:

- `public/electron.js`
- `public/preload.js`
- `src/components/SettingsPanel.tsx`

**Depends on**: T4
**Reuses**:

- novo window bridge
- settings persistidos

**Requirement**: DWC-04, DWC-05

**Done when**:

- [ ] Existe uma hotkey confiável para alternar click-through
- [ ] Existe uma hotkey confiável para restaurar e focar a janela
- [ ] Falhas de registro não deixam o app sem caminho de recuperação

**Tests**: manual Electron verification
**Gate**: `npm test` e checklist manual de hotkeys

---

### T6: Adicionar tray e comportamento de minimizar para segundo plano

**What**: Criar ícone/menu de bandeja, manter o app rodando em segundo plano ao
minimizar e permitir restauração/encerramento pela tray.
**Where**:

- `public/electron.js`
- `public/` assets de ícone
- opcionalmente `src/components/SettingsPanel.tsx`

**Depends on**: T5
**Reuses**:

- lógica de foco da janela
- settings de janela

**Requirement**: DWC-06, DWC-07

**Done when**:

- [ ] O app continua ativo na bandeja quando minimizado com a opção habilitada
- [ ] O ícone/menu da tray restaura e encerra o app corretamente
- [ ] O fluxo não conflita com a hotkey global de foco

**Tests**: manual Electron verification
**Gate**: `npm test` e checklist manual de tray

---

## Validation Notes

- O repositório ainda não possui `.specs/codebase/TESTING.md`; por isso os gates foram
  ancorados nos comandos já presentes no projeto (`npm test`) e em verificações manuais
  explícitas para comportamentos Electron que não estão cobertos por testes automatizados
  hoje.
- A ordem acima prioriza segurança operacional: primeiro criar caminhos de recuperação da
  janela, depois habilitar comportamentos que podem “sumir” com ela do fluxo normal
  (click-through e tray).
