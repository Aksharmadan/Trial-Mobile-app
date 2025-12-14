import { Platform } from "react-native";

const primaryLight = "#2563EB";
const primaryDark = "#3B82F6";

export const Colors = {
  light: {
    text: "#0F172A",
    textSecondary: "#64748B",
    textDisabled: "#94A3B8",
    buttonText: "#FFFFFF",
    tabIconDefault: "#64748B",
    tabIconSelected: primaryLight,
    link: primaryLight,
    primary: primaryLight,
    primaryLight: "#DBEAFE",
    secondary: "#059669",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
    backgroundRoot: "#F8FAFC",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F1F5F9",
    backgroundTertiary: "#E2E8F0",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    border: "#E2E8F0",
    borderLight: "#F1F5F9",
    gradient: {
      primary: ["#2563EB", "#1D4ED8"],
      accent: ["#7C3AED", "#6D28D9"],
      success: ["#10B981", "#059669"],
      surface: ["#FFFFFF", "#F8FAFC"],
    },
  },
  dark: {
    text: "#F1F5F9",
    textSecondary: "#94A3B8",
    textDisabled: "#64748B",
    buttonText: "#FFFFFF",
    tabIconDefault: "#94A3B8",
    tabIconSelected: primaryDark,
    link: primaryDark,
    primary: primaryDark,
    primaryLight: "#1E3A5F",
    secondary: "#34D399",
    success: "#34D399",
    warning: "#FBBF24",
    error: "#F87171",
    info: "#60A5FA",
    backgroundRoot: "#0F172A",
    backgroundDefault: "#1E293B",
    backgroundSecondary: "#334155",
    backgroundTertiary: "#475569",
    surface: "#1E293B",
    surfaceElevated: "#334155",
    border: "#334155",
    borderLight: "#1E293B",
    gradient: {
      primary: ["#3B82F6", "#2563EB"],
      accent: ["#8B5CF6", "#7C3AED"],
      success: ["#34D399", "#10B981"],
      surface: ["#1E293B", "#0F172A"],
    },
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 52,
  buttonHeight: 56,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 34,
    fontWeight: "800" as const,
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  h2: {
    fontSize: 28,
    fontWeight: "700" as const,
    letterSpacing: -0.3,
    lineHeight: 36,
  },
  h3: {
    fontSize: 22,
    fontWeight: "600" as const,
    letterSpacing: -0.2,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: "600" as const,
    letterSpacing: -0.1,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: "500" as const,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  link: {
    fontSize: 16,
    fontWeight: "500" as const,
    lineHeight: 24,
  },
  number: {
    fontSize: 48,
    fontWeight: "800" as const,
    letterSpacing: -1,
  },
  label: {
    fontSize: 11,
    fontWeight: "600" as const,
    letterSpacing: 0.8,
    textTransform: "uppercase" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "'SF Mono', SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  card: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  fab: {
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 6,
  },
};
