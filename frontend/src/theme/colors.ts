interface ThemeColors {
  text: string;
  subtext: string;
  title: string;
  background: string;
  navBackground: string;
  iconColour: string;
  iconColourFocused: string;
  uiBackground: string;
  inputBackground: string;
  border: string;
  cardBackground: string;
  elevated: string;
}

interface CategoryColors {
  music: string;
  podcasts: string;
  liveEvents: string;
  madeForYou: string;
  newReleases: string;
  hindi: string;
  punjabi: string;
  pop: string;
  charts: string;
  indie: string;
  discover: string;
  mood: string;
  workout: string;
  sleep: string;
  party: string;
  focus: string;
  rock: string;
  hiphop: string;
}

interface GradientColors {
  premiumStart: string;
  premiumEnd: string;
  headerStart: string;
  headerEnd: string;
}

interface ColorsType {
  primary: string;
  secondary: string;
  warning: string;
  pink: string;
  spotify: string;
  spotifyDark: string;
  spotifyLight: string;
  categories: CategoryColors;
  gradients: GradientColors;
  dark: ThemeColors;
  light: ThemeColors;
}

export const Colors: ColorsType = {
  // Main accent colors
  primary: '#4F46E5',
  secondary: '#10B981',
  warning: '#EF4444',
  pink: '#D82D8B',

  // Spotify colors
  spotify: '#1DB954',
  spotifyDark: '#1AA34A',
  spotifyLight: '#1ED760',

  // Category card colors (for search page)
  categories: {
    music: '#E13300',
    podcasts: '#006450',
    liveEvents: '#8D67AB',
    madeForYou: '#1E3264',
    newReleases: '#E8115B',
    hindi: '#E1118B',
    punjabi: '#148A08',
    pop: '#8D67AB',
    charts: '#8D67AB',
    indie: '#608108',
    discover: '#E91429',
    mood: '#477D95',
    workout: '#777777',
    sleep: '#503750',
    party: '#AF2896',
    focus: '#503750',
    rock: '#EB1E32',
    hiphop: '#BA5D07',
  },

  // Gradient colors for premium
  gradients: {
    premiumStart: '#1DB954',
    premiumEnd: '#191414',
    headerStart: '#535353',
    headerEnd: '#121212',
  },

  dark: {
    text: '#F3F4F6',
    subtext: '#B3B3B3',
    title: '#FFFFFF',
    background: '#121212',
    navBackground: '#000000',
    iconColour: '#B3B3B3',
    iconColourFocused: '#FFFFFF',
    uiBackground: '#282828',
    inputBackground: '#3E3E3E',
    border: '#282828',
    cardBackground: '#181818',
    elevated: '#282828',
  },
  light: {
    text: '#1F2937',
    subtext: '#6B7280',
    title: '#111827',
    background: '#FFFFFF',
    navBackground: '#F3F4F6',
    iconColour: '#6B7280',
    iconColourFocused: '#4F46E5',
    uiBackground: '#F9FAFB',
    inputBackground: '#F3F4F6',
    border: '#E5E7EB',
    cardBackground: '#F9FAFB',
    elevated: '#FFFFFF',
  }
};
