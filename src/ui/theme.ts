export const colors = {
  bg: '#15110d',
  bg2: '#1d1611',
  card: '#241b14',
  card2: '#2d221a',
  line: '#3a2c20',
  ink: '#f4ebdc',
  muted: '#b6a48d',
  faint: '#7d6c58',
  gold: '#e9bd5a',
  goldSoft: '#f6d98c',
  ember: '#ef7c3a',
  jade: '#6fc6a3',
  sky: '#76aee6',
  violet: '#bb95dd',
  rose: '#e88aa0',
  inkOnGold: '#1a120a',
  wellDark: '#160f09',
} as const;

export const accent = {
  workout: colors.ember,
  food: colors.jade,
  study: colors.sky,
  screen: colors.violet,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 99,
} as const;

export const fonts = {
  display: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_800ExtraBold',
  displayItalic: 'Fraunces_500Medium_Italic',
  body: 'Manrope_400Regular',
  bodyMed: 'Manrope_500Medium',
  bodySemi: 'Manrope_600SemiBold',
  bodyBold: 'Manrope_700Bold',
  pixel: 'Silkscreen_400Regular',
} as const;

export type AccentKey = keyof typeof accent;
