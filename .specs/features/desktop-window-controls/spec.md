# Desktop Window Controls Specification

## Problem Statement

Hoje o PomoBeats roda dentro de uma janela Electron genérica, com barra nativa, área
ociosa ao redor do layout e sem controles desktop como opacidade, tray e atalhos
globais. Isso enfraquece o objetivo de o app funcionar como um companion leve e
sempre acessível sobre a área de trabalho.

## Goals

- [ ] Permitir controlar a janela desktop do app sem depender da barra nativa do
      sistema
- [ ] Tornar a janela mais adequada ao uso always-on-top com opacidade e click-through
- [ ] Permitir recuperar o app rapidamente por hotkeys e pela bandeja do sistema

## Out of Scope

Explicitamente fora deste escopo para evitar expansão indevida.

| Feature | Reason |
| --- | --- |
| Redimensionamento livre da janela | O objetivo é encaixar a janela ao design fixo atual |
| Reescrita visual ampla de todas as telas | Só os ajustes necessários para acomodar shell customizado |
| Empacotamento e distribuição multi-plataforma completa | O foco é a implementação funcional no app atual |
| Editor avançado de hotkeys com captura dinâmica | Configuração textual/seleção simples é suficiente neste ciclo |

---

## User Stories

### P1: Shell desktop controlável ⭐ MVP

**User Story**: Como usuário desktop, quero que a janela do PomoBeats tenha moldura
customizada e tamanho exato do design para que o app pareça um utilitário nativo e
compacto.

**Why P1**: Sem isso, o restante das features continua preso a uma janela Electron
genérica e parte da área visível permanece desperdiçada.

**Acceptance Criteria**:

1. WHEN o app abrir THEN o sistema SHALL renderizar a interface ocupando a área útil
   real da janela, sem o card interno simulando outra moldura.
2. WHEN o app abrir THEN o sistema SHALL usar uma barra de título customizada alinhada
   ao design do produto em vez da moldura padrão do Electron.
3. WHEN o usuário interagir com os controles da barra customizada THEN o sistema SHALL
   permitir ao menos minimizar e fechar a janela.

**Independent Test**: Abrir o app em Electron e confirmar visualmente que a janela tem
apenas o tamanho do design e usa header customizado funcional.

---

### P1: Controles de opacidade e click-through ⭐ MVP

**User Story**: Como usuário que mantém o app sobre outras janelas, quero ajustar a
opacidade e alternar se ele recebe cliques para que eu possa estudar sem perder acesso
ao conteúdo de fundo.

**Why P1**: Esse é o ganho funcional central do app como overlay desktop.

**Acceptance Criteria**:

1. WHEN o usuário alterar a opacidade nas configurações THEN o sistema SHALL aplicar a
   nova opacidade na `BrowserWindow` em tempo real e persistir a preferência.
2. WHEN o usuário acionar a hotkey de click-through THEN o sistema SHALL alternar entre
   janela clicável e não clicável sem perder a capacidade de recuperação.
3. WHEN o modo não clicável estiver ativo THEN o sistema SHALL manter alguma forma de
   feedback de estado ou recuperação por hotkey.

**Independent Test**: Alterar a opacidade na UI, reiniciar o app e confirmar persistência;
acionar a hotkey e validar que a janela deixa e volta a receber cliques.

---

### P1: Recuperação rápida da janela ⭐ MVP

**User Story**: Como usuário desktop, quero uma hotkey para trazer o app ao primeiro
plano mesmo minimizado para que eu consiga retomá-lo sem procurar a janela manualmente.

**Why P1**: Click-through e minimize-to-tray ficam frágeis sem uma forma confiável de
recuperar a janela.

**Acceptance Criteria**:

1. WHEN o usuário acionar a hotkey de foco THEN o sistema SHALL restaurar a janela caso
   esteja minimizada ou oculta.
2. WHEN a janela for restaurada por hotkey THEN o sistema SHALL trazê-la para frente e
   focá-la.
3. WHEN a hotkey de foco for usada enquanto o app estiver visível THEN o sistema SHALL
   apenas reforçar foco sem quebrar o estado atual.

**Independent Test**: Minimizar ou ocultar o app, usar a hotkey e confirmar restauração
com foco.

---

### P2: Bandeja do sistema

**User Story**: Como usuário que quer o app sempre disponível, quero que ele continue na
bandeja do sistema ao ser minimizado para que eu possa mantê-lo em segundo plano sem
poluir a barra de tarefas.

**Why P2**: Importante para a rotina desktop, mas depende da base de janela e hotkeys.

**Acceptance Criteria**:

1. WHEN o app for minimizado com a opção habilitada THEN o sistema SHALL escondê-lo e
   mantê-lo ativo na bandeja do sistema.
2. WHEN o usuário clicar no ícone da bandeja ou em sua ação principal THEN o sistema
   SHALL restaurar e focar a janela.
3. WHEN o usuário escolher sair pelo menu da bandeja THEN o sistema SHALL encerrar o app
   explicitamente.

**Independent Test**: Minimizar o app, confirmar ícone na tray, restaurar pela tray e
encerrar pelo menu.

---

## Edge Cases

- WHEN a hotkey configurada entrar em conflito ou falhar no registro THEN o sistema
  SHALL manter um atalho padrão seguro e registrar erro recuperável.
- WHEN a opacidade for ajustada para valores muito baixos THEN o sistema SHALL respeitar
  um limite mínimo utilizável.
- WHEN click-through estiver ativo e a janela for restaurada THEN o sistema SHALL ainda
  permitir retorno ao estado clicável por hotkey.
- WHEN o ícone da bandeja não puder ser carregado THEN o sistema SHALL falhar de forma
  visível em desenvolvimento em vez de silenciar totalmente o problema.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| DWC-01 | P1: Shell desktop controlável | Design | Pending |
| DWC-02 | P1: Shell desktop controlável | Design | Pending |
| DWC-03 | P1: Controles de opacidade e click-through | Design | Pending |
| DWC-04 | P1: Controles de opacidade e click-through | Design | Pending |
| DWC-05 | P1: Recuperação rápida da janela | Design | Pending |
| DWC-06 | P2: Bandeja do sistema | Design | Pending |
| DWC-07 | P2: Bandeja do sistema | Design | Pending |

**Coverage:** 7 total, 0 mapped to tasks, 7 unmapped.

---

## Success Criteria

- [ ] O app abre com moldura customizada e sem área visual sobrando ao redor do design
- [ ] O usuário consegue ajustar opacidade e manter a preferência após reiniciar o app
- [ ] O usuário consegue alternar click-through e recuperar a janela por hotkey
- [ ] O app pode permanecer na bandeja do sistema e ser restaurado sem reinício
