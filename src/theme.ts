import { createTheme } from "@mui/material/styles";

export type ThemeMode = "light" | "dark";

const headingFont = '"Sora", "Manrope", system-ui, sans-serif';
const bodyFont = '"Manrope", "Segoe UI", system-ui, sans-serif';

export const createAppTheme = (mode: ThemeMode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "dark" ? "#A3E635" : "#65A30D",
        contrastText: mode === "dark" ? "#0B0F1A" : "#FFFFFF",
      },
      secondary: {
        main: mode === "dark" ? "#8B5CF6" : "#7C3AED",
      },
      error: {
        main: mode === "dark" ? "#F87171" : "#DC2626",
      },
      warning: {
        main: mode === "dark" ? "#FBBF24" : "#D97706",
      },
      background: {
        default: mode === "dark" ? "#0B0F1A" : "#F6F7F3",
        paper: mode === "dark" ? "#111827" : "#FFFFFF",
      },
      text: {
        primary: mode === "dark" ? "#EDF2F7" : "#101828",
        secondary: mode === "dark" ? "#93A1B8" : "#51606F",
      },
      divider:
        mode === "dark"
          ? "rgba(147, 161, 184, 0.14)"
          : "rgba(16, 24, 40, 0.1)",
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily: bodyFont,
      h1: { fontFamily: headingFont, fontWeight: 700 },
      h2: { fontFamily: headingFont, fontWeight: 700 },
      h3: { fontFamily: headingFont, fontWeight: 700 },
      h4: { fontFamily: headingFont, fontWeight: 700 },
      h5: { fontFamily: headingFont, fontWeight: 600 },
      h6: { fontFamily: headingFont, fontWeight: 600 },
      button: { fontFamily: headingFont, fontWeight: 600, textTransform: "none" },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            background: "var(--bg-paper)",
            backgroundImage: "none",
            border: "1px solid var(--border)",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            background: "var(--bg-paper-solid)",
            borderRadius: 20,
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-card-hover)",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: "none",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            colorScheme: "var(--color-scheme)" as never,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            background: "var(--bg-paper-solid)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-card)",
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            background: "var(--bg-surface)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            fontSize: "0.75rem",
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: "1px solid var(--divider)",
          },
        },
      },
    },
  });
