import { createTheme } from "@mui/material/styles";

export type ThemeMode = "light" | "dark";

const headingFont = '"Chivo", "Space Grotesk", system-ui, sans-serif';
const bodyFont = '"Space Grotesk", "Segoe UI", system-ui, sans-serif';

export const createAppTheme = (mode: ThemeMode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "dark" ? "#FF6B00" : "#E85F00",
        contrastText: mode === "dark" ? "#120524" : "#FFFFFF",
      },
      secondary: {
        main: mode === "dark" ? "#8B5CF6" : "#7928CA",
      },
      error: {
        main: mode === "dark" ? "#F87171" : "#DC2626",
      },
      warning: {
        main: mode === "dark" ? "#FBBF24" : "#D97706",
      },
      background: {
        default: mode === "dark" ? "#120524" : "#FFFFFF",
        paper: mode === "dark" ? "#1B0F36" : "#FFFFFF",
      },
      text: {
        primary: mode === "dark" ? "#EFE8FF" : "#120524",
        secondary: mode === "dark" ? "#B3A4D4" : "#5A4D76",
      },
      divider:
        mode === "dark"
          ? "rgba(179, 164, 212, 0.14)"
          : "rgba(18, 5, 36, 0.1)",
    },
    shape: { borderRadius: 12 },
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
