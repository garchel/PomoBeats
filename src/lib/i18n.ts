import type { AppLanguage, IntervalType, MusicSource, RadioCategory } from "../types/pomo";

type TranslationValues = Record<string, string | number>;

const translations = {
  "pt-BR": {
    "common.of": "de",
    "common.sound": "Som",
    "common.category": "Categoria",
    "common.source": "Origem",
    "common.customFile": "Usar arquivo customizado",
    "common.selectedFile": "Selecionado: {path}",
    "common.minutesShort": "min",
    "common.hoursShort": "h",
    "nav.mySessions": "Minhas sessões",
    "nav.currentSession": "Sessão atual",
    "nav.settings": "Configurações",
    "settings.title": "Configurações",
    "settings.description": "Controle automações, idioma e comportamento de áudio.",
    "settings.languageSection": "Idioma",
    "settings.language": "Idioma",
    "settings.languageHelp": "Muda imediatamente os textos do app e o formato local de datas.",
    "settings.language.pt-BR": "Português (Brasil)",
    "settings.language.en-US": "English",
    "settings.automation": "Automação",
    "settings.sound": "Som",
    "settings.autoCheckTasks": "Verificação automática de tarefas",
    "settings.autoCheckTasksHelp":
      "Mantém essa preferência salva para automações futuras. Ainda não altera tarefas automaticamente no app.",
    "settings.autoStartBreaks": "Iniciar intervalos automaticamente",
    "settings.autoStartBreaksHelp":
      "Quando um bloco de estudo termina, o intervalo seguinte começa sozinho se esta opção estiver ativa.",
    "settings.autoStartPomos": "Iniciar pomos automaticamente",
    "settings.autoStartPomosHelp":
      "Quando um intervalo termina, o próximo bloco de estudo começa automaticamente se esta opção estiver ativa.",
    "settings.alarm": "Alarme",
    "settings.alarmHelp":
      "Toca quando um bloco termina. O volume do alarme afeta apenas esse aviso final.",
    "settings.alarmSoundHelp":
      "Escolhe o tipo de alarme interno usado quando o modo customizado estiver desligado.",
    "settings.alarmVolume": "Volume do alarme",
    "settings.alarmVolumeHelp":
      "Controla apenas o volume do alarme. Em 0%, o alarme fica silencioso.",
    "settings.customAlarmHelp":
      "Se estiver ativo, o app toca o arquivo enviado em vez do alarme interno.",
    "settings.studyMusic": "Música de estudo",
    "settings.studyMusicHelp":
      "Define o áudio usado durante os blocos de foco. O botão liga ou silencia essa trilha por completo.",
    "settings.intervalMusic": "Música de intervalo",
    "settings.intervalMusicHelp":
      "Define o áudio usado nos intervalos. O botão liga ou silencia toda a trilha de pausa.",
    "settings.sourceHelp":
      "Rádio usa uma estação online por categoria, Gerado toca a trilha interna e Arquivo customizado usa um áudio seu.",
    "settings.generatedSoundHelp.study":
      "Seleciona uma das trilhas internas do app para os momentos de estudo.",
    "settings.generatedSoundHelp.interval":
      "Seleciona uma das trilhas internas do app para os intervalos.",
    "settings.radioCategoryHelp.study":
      "Escolhe o estilo da rádio para os blocos de estudo. O player ainda pode mostrar canais alternativos dessa categoria.",
    "settings.radioCategoryHelp.interval":
      "Escolhe o estilo da rádio para os intervalos. Se uma rádio falhar, o player tenta outras da mesma categoria.",
    "settings.customStudyHelp":
      "Ative para usar um arquivo local durante os blocos de estudo em vez da rádio ou trilha interna.",
    "settings.customIntervalHelp":
      "Ative para tocar um arquivo local durante os intervalos.",
    "settings.studyVolume": "Volume do estudo",
    "settings.studyVolumeHelp":
      "Controla apenas o volume da música dos blocos de estudo. Em 0%, ela fica muda.",
    "settings.intervalVolume": "Volume do intervalo",
    "settings.intervalVolumeHelp":
      "Controla apenas o volume da música de intervalo. Em 0%, ela fica muda.",
    "settings.source.generated": "Gerado",
    "settings.source.radio": "Rádio",
    "settings.source.custom": "Arquivo customizado",
    "settings.radioCategory.lofi": "Lo-fi",
    "settings.radioCategory.pop": "Pop",
    "settings.radioCategory.anime": "Anime",
    "settings.radioCategory.kpop": "K-pop",
    "settings.radioCategory.rock": "Rock",
    "settings.alarmOption.Beep": "Bipe",
    "settings.alarmOption.Chime": "Sino suave",
    "settings.alarmOption.Bell": "Sino",
    "settings.track.Track 1": "Faixa 1",
    "settings.track.Track 2": "Faixa 2",
    "settings.track.Track 3": "Faixa 3",
    "sessionControl.break": "Intervalo",
    "sessionControl.breakButton": "☕ Intervalo",
    "sessionControl.pomo": "Pomo",
    "sessionControl.pomoButton": "🍅 Pomo",
    "sessionControl.nameLabel.pomo": "Nome do pomo",
    "sessionControl.nameLabel.break": "Nome do intervalo",
    "sessionControl.nameError.pomo": "Digite um nome para o pomo.",
    "sessionControl.nameError.break": "Digite um nome para o intervalo.",
    "sessionControl.durationError": "O período deve ter ao menos 1 minuto.",
    "sessionControl.addSuccess.pomo": "Pomo adicionado com sucesso.",
    "sessionControl.addSuccess.break": "Intervalo adicionado com sucesso.",
    "session.titlePlaceholder": "Título",
    "session.titleLabel": "Título da sessão",
    "session.save": "Salvar sessão",
    "session.export": "Exportar sessão",
    "session.openPlayer": "Iniciar sessão",
    "session.backToEdit": "Voltar para edição",
    "session.sequence": "Sequência da sessão",
    "session.empty": "Nenhum bloco adicionado",
    "session.exportError": "Adicione um título e ao menos um intervalo para exportar.",
    "session.exportSuccess": "Sessão exportada com sucesso.",
    "player.empty": "Adicione blocos na sessão para iniciar o player.",
    "player.completed": "Sessão concluída",
    "player.previous": "Bloco anterior",
    "player.play": "Iniciar ou retomar",
    "player.pause": "Pausar",
    "player.next": "Próximo bloco",
    "player.channel": "Canal {index}",
    "lists.title": "Minhas sessões",
    "lists.import": "Importar sessão",
    "lists.searchPlaceholder": "Buscar por nome da sessão",
    "lists.emptyTitle": "Nenhuma sessão salva ainda",
    "lists.emptyDescription":
      "Monte uma sessão na tela principal ou importe um arquivo JSON exportado pelo app.",
    "lists.noResultsTitle": "Nenhum resultado encontrado",
    "lists.noResultsDescription": "Tente buscar com outro nome de sessão.",
    "lists.updatedAt": "Atualizada em {date}",
    "lists.intervals": "{count} intervalos",
    "lists.open": "Abrir",
    "lists.openTitle": "Abrir sessão",
    "lists.deleteTitle": "Excluir sessão",
    "lists.loadSuccess": "Sessão \"{title}\" carregada com sucesso.",
    "lists.loadError": "Não foi possível carregar esta sessão.",
    "lists.deleteSuccess": "Sessão \"{title}\" excluída com sucesso.",
    "lists.deleteError": "Não foi possível excluir esta sessão.",
    "lists.fetchError": "Não foi possível carregar as sessões salvas.",
    "lists.invalidImport": "Arquivo inválido. Use uma sessão exportada pelo app.",
    "lists.importSuccess": "Sessão \"{title}\" importada com sucesso.",
    "lists.importReadError": "Não foi possível ler o arquivo selecionado.",
    "context.startError": "Adicione ao menos um intervalo para iniciar a sessão.",
    "context.saveError":
      "Para salvar, adicione um título e pelo menos um intervalo válido.",
    "context.saveSuccess": "Sessão salva com sucesso.",
    "context.settingsLoadError": "Erro ao carregar configurações salvas.",
    "interval.type.pomo": "Pomo",
    "interval.type.break": "Intervalo",
  },
  "en-US": {
    "common.of": "of",
    "common.sound": "Sound",
    "common.category": "Category",
    "common.source": "Source",
    "common.customFile": "Use custom file",
    "common.selectedFile": "Selected: {path}",
    "common.minutesShort": "min",
    "common.hoursShort": "hr",
    "nav.mySessions": "My sessions",
    "nav.currentSession": "Current session",
    "nav.settings": "Settings",
    "settings.title": "Settings",
    "settings.description": "Control automation, language, and audio behavior.",
    "settings.languageSection": "Language",
    "settings.language": "Language",
    "settings.languageHelp": "Changes the app text and the local date format immediately.",
    "settings.language.pt-BR": "Portuguese (Brazil)",
    "settings.language.en-US": "English",
    "settings.automation": "Automation",
    "settings.sound": "Sound",
    "settings.autoCheckTasks": "Auto-check tasks",
    "settings.autoCheckTasksHelp":
      "Keeps this preference saved for future automations. It does not automatically change tasks in the app yet.",
    "settings.autoStartBreaks": "Auto-start breaks",
    "settings.autoStartBreaksHelp":
      "When a study block ends, the next break starts automatically if this option is enabled.",
    "settings.autoStartPomos": "Auto-start pomos",
    "settings.autoStartPomosHelp":
      "When a break ends, the next study block starts automatically if this option is enabled.",
    "settings.alarm": "Alarm",
    "settings.alarmHelp":
      "Plays when a block ends. The alarm volume only affects this ending cue.",
    "settings.alarmSoundHelp":
      "Chooses the built-in alarm sound used when custom mode is turned off.",
    "settings.alarmVolume": "Alarm volume",
    "settings.alarmVolumeHelp":
      "Controls only the alarm volume. At 0%, the alarm is silent.",
    "settings.customAlarmHelp":
      "If enabled, the app plays your uploaded file instead of the built-in alarm.",
    "settings.studyMusic": "Study music",
    "settings.studyMusicHelp":
      "Defines the audio used during focus blocks. The switch turns this track on or off entirely.",
    "settings.intervalMusic": "Break music",
    "settings.intervalMusicHelp":
      "Defines the audio used during breaks. The switch turns the entire break track on or off.",
    "settings.sourceHelp":
      "Radio uses an online station by category, Generated plays the app's built-in track, and Custom file uses your own audio.",
    "settings.generatedSoundHelp.study":
      "Selects one of the app's built-in tracks for study blocks.",
    "settings.generatedSoundHelp.interval":
      "Selects one of the app's built-in tracks for breaks.",
    "settings.radioCategoryHelp.study":
      "Chooses the radio style for study blocks. The player can still show alternate channels from the same category.",
    "settings.radioCategoryHelp.interval":
      "Chooses the radio style for breaks. If one station fails, the player tries others from the same category.",
    "settings.customStudyHelp":
      "Enable this to use a local file during study blocks instead of radio or the built-in track.",
    "settings.customIntervalHelp": "Enable this to play a local file during breaks.",
    "settings.studyVolume": "Study volume",
    "settings.studyVolumeHelp":
      "Controls only the study music volume. At 0%, it is muted.",
    "settings.intervalVolume": "Break volume",
    "settings.intervalVolumeHelp":
      "Controls only the break music volume. At 0%, it is muted.",
    "settings.source.generated": "Generated",
    "settings.source.radio": "Radio",
    "settings.source.custom": "Custom file",
    "settings.radioCategory.lofi": "Lo-fi",
    "settings.radioCategory.pop": "Pop",
    "settings.radioCategory.anime": "Anime",
    "settings.radioCategory.kpop": "K-pop",
    "settings.radioCategory.rock": "Rock",
    "settings.alarmOption.Beep": "Beep",
    "settings.alarmOption.Chime": "Chime",
    "settings.alarmOption.Bell": "Bell",
    "settings.track.Track 1": "Track 1",
    "settings.track.Track 2": "Track 2",
    "settings.track.Track 3": "Track 3",
    "sessionControl.break": "Break",
    "sessionControl.breakButton": "☕ Break",
    "sessionControl.pomo": "Pomo",
    "sessionControl.pomoButton": "🍅 Pomo",
    "sessionControl.nameLabel.pomo": "Pomo name",
    "sessionControl.nameLabel.break": "Break name",
    "sessionControl.nameError.pomo": "Enter a name for the pomo.",
    "sessionControl.nameError.break": "Enter a name for the break.",
    "sessionControl.durationError": "The block must be at least 1 minute long.",
    "sessionControl.addSuccess.pomo": "Pomo added successfully.",
    "sessionControl.addSuccess.break": "Break added successfully.",
    "session.titlePlaceholder": "Title",
    "session.titleLabel": "Session title",
    "session.save": "Save session",
    "session.export": "Export session",
    "session.openPlayer": "Start session",
    "session.backToEdit": "Back to edit",
    "session.sequence": "Session sequence",
    "session.empty": "No blocks added",
    "session.exportError": "Add a title and at least one interval to export.",
    "session.exportSuccess": "Session exported successfully.",
    "player.empty": "Add blocks to the session to start the player.",
    "player.completed": "Session completed",
    "player.previous": "Previous block",
    "player.play": "Start or resume",
    "player.pause": "Pause",
    "player.next": "Next block",
    "player.channel": "Channel {index}",
    "lists.title": "My sessions",
    "lists.import": "Import session",
    "lists.searchPlaceholder": "Search by session name",
    "lists.emptyTitle": "No saved sessions yet",
    "lists.emptyDescription":
      "Build a session on the main screen or import a JSON file exported by the app.",
    "lists.noResultsTitle": "No results found",
    "lists.noResultsDescription": "Try searching with a different session name.",
    "lists.updatedAt": "Updated on {date}",
    "lists.intervals": "{count} intervals",
    "lists.open": "Open",
    "lists.openTitle": "Open session",
    "lists.deleteTitle": "Delete session",
    "lists.loadSuccess": "Session \"{title}\" loaded successfully.",
    "lists.loadError": "Could not load this session.",
    "lists.deleteSuccess": "Session \"{title}\" deleted successfully.",
    "lists.deleteError": "Could not delete this session.",
    "lists.fetchError": "Could not load saved sessions.",
    "lists.invalidImport": "Invalid file. Use a session exported by the app.",
    "lists.importSuccess": "Session \"{title}\" imported successfully.",
    "lists.importReadError": "Could not read the selected file.",
    "context.startError": "Add at least one interval to start the session.",
    "context.saveError":
      "To save, add a title and at least one valid interval.",
    "context.saveSuccess": "Session saved successfully.",
    "context.settingsLoadError": "Could not load saved settings.",
    "interval.type.pomo": "Pomo",
    "interval.type.break": "Break",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["pt-BR"];

export const LANGUAGE_OPTIONS: Array<{ value: AppLanguage; labelKey: TranslationKey }> = [
  { value: "pt-BR", labelKey: "settings.language.pt-BR" },
  { value: "en-US", labelKey: "settings.language.en-US" },
];

export const translate = (
  language: AppLanguage,
  key: TranslationKey,
  values?: TranslationValues
) : string => {
  const dictionary = translations[language] ?? translations["pt-BR"];
  const text = String(dictionary[key] ?? translations["pt-BR"][key]);

  if (!values) {
    return text;
  }

  let result = text;

  for (const [token, value] of Object.entries(values)) {
    result = result.replaceAll(`{${token}}`, String(value));
  }

  return result;
};

export const getLocale = (language: AppLanguage) => language;

export const getMusicSourceLabel = (language: AppLanguage, source: MusicSource) =>
  translate(language, `settings.source.${source}` as TranslationKey);

export const getRadioCategoryLabel = (
  language: AppLanguage,
  category: RadioCategory
) => translate(language, `settings.radioCategory.${category}` as TranslationKey);

export const getAlarmOptionLabel = (language: AppLanguage, value: string) =>
  translate(language, `settings.alarmOption.${value}` as TranslationKey);

export const getTrackOptionLabel = (language: AppLanguage, value: string) =>
  translate(language, `settings.track.${value}` as TranslationKey);

export const getIntervalTypeLabel = (language: AppLanguage, type: IntervalType) =>
  translate(language, `interval.type.${type}` as TranslationKey);

export const formatLocalizedDuration = (
  language: AppLanguage,
  totalMinutes: number
) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}${translate(language, "common.minutesShort")}`;
  }

  if (minutes === 0) {
    return `${hours}${translate(language, "common.hoursShort")}`;
  }

  return `${hours}${translate(language, "common.hoursShort")} ${minutes}${translate(
    language,
    "common.minutesShort"
  )}`;
};

export const formatLocalizedDate = (language: AppLanguage, value: string) => {
  const date = new Date(value);
  return new Intl.DateTimeFormat(getLocale(language)).format(date);
};
