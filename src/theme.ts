// Toutes les couleurs et dimensions de l'interface d'Ora.

export const colors = {
  bg: '#0A0C0B',
  bar: '#0F1211', // barre du bas, feuille modale
  card: '#121614',
  cardBorder: '#232925',
  track: '#1B211E', // piste / case vide
  outline: '#2A322E', // contours neutres
  text: '#F3F6F4',
  textSecondary: '#8E9A93',
  gridLine: 'rgba(255,255,255,0.03)',

  green: '#3DDC84',
  greenBgFrom: '#0F2A1B',
  greenBgTo: '#0C1F15',
  greenMedal: '#123422',
  greenPillTo: '#0B1A12',
  greenSoftBg: '#0C1F15',
  greenSoftBorder: '#1F5A39',
  greenSoftText: '#BFEFD3',
  greenHalo: 'rgba(61,220,132,0.28)',

  red: '#FF5C5C',
  redBgFrom: '#2A1213',
  redBgTo: '#1C0D0E',
  redMedal: '#3A1819',
  redText: '#FF9A9A',
  redSoftBorder: '#5A2124',
  historyRed: '#B3363A',

  amber: '#F5A524',

  streak: '#FFB04A',
  streakBg: '#1A1410',
  streakBorder: '#5A3A12',

  notPlanned: '#1F2622',
  onGreen: '#0A0C0B', // texte / icône sur fond vert ou blanc
  backdrop: 'rgba(0,0,0,0.55)',
} as const;

export const radius = {
  card: 24,
  button: 18,
  row: 20,
  sheet: 32,
  pill: 999,
  bar: 10,
  cell: 4,
} as const;

export const sizes = {
  gridCell: 32,
  touch: 44,
  gutter: 24,

  scorePillW: 232,
  scorePillH: 96,
  scoreHalo: 56,

  habitCardH: 68,
  habitCardPad: 14,
  medallion: 40,
  checkButton: 46,

  tabBarH: 84,
  fab: 56,
  fabLift: 24,
  fabRing: 6,

  statCardH: 112,
  ring: 84,
  ringStroke: 8,
  statPillH: 56,
  weekBarW: 26,
  weekBarH: 120,
  habitRowH: 52,
  progressH: 8,

  historyCell: 14,
  historyGap: 3,
  historyWeeks: 16,

  sheetTop: 96,
  handleW: 44,
  handleH: 5,
  emojiButton: 56,
  input: 56,
  dayChip: 44,
  timeBlockW: 76,
  timeBlockH: 64,
  primaryButton: 56,
  settingsRowMin: 64,
} as const;

export const fonts = {
  display: 'SpaceGrotesk_700Bold',
  displayMedium: 'SpaceGrotesk_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

export const type = {
  wordmark: { fontFamily: fonts.display, fontSize: 26, letterSpacing: -0.5, color: colors.text },
  screenTitle: { fontFamily: fonts.display, fontSize: 30, letterSpacing: -0.5, color: colors.text },
  score: { fontFamily: fonts.display, fontSize: 58, letterSpacing: -2, color: colors.green },
  overline: {
    fontFamily: fonts.body,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    color: colors.textSecondary,
  },
  body: { fontFamily: fonts.body, fontSize: 14, color: colors.text },
  habitName: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.text },
} as const;

export type Tone = { main: string; from: string; to: string; halo: string };

/** Teintes de la pastille de score selon la progression. */
export const scoreTones = {
  green: { main: colors.green, from: colors.greenBgFrom, to: colors.greenPillTo, halo: colors.greenHalo },
  amber: { main: colors.amber, from: '#2A2110', to: '#1A140A', halo: 'rgba(245,165,36,0.28)' },
  red: { main: colors.red, from: colors.redBgFrom, to: colors.redBgTo, halo: 'rgba(255,92,92,0.28)' },
  neutral: { main: colors.textSecondary, from: colors.card, to: colors.bar, halo: 'rgba(0,0,0,0)' },
} satisfies Record<string, Tone>;

export function scoreTone(pct: number, empty: boolean): Tone {
  if (empty) return scoreTones.neutral;
  if (pct >= 70) return scoreTones.green;
  if (pct >= 40) return scoreTones.amber;
  return scoreTones.red;
}

/** Seuils : >= 70 % vert, 40–69 % ambre, < 40 % rouge. */
export function rateColor(pct: number): string {
  if (pct >= 70) return colors.green;
  if (pct >= 40) return colors.amber;
  return colors.red;
}
