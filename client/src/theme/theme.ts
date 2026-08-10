import { createTheme, alpha } from '@mui/material/styles';

// ── Brand tokens ─────────────────────────────────────────────────────────────
const PRIMARY = '#4F46E5';   // indigo-600
const SECONDARY = '#7C3AED'; // violet-600

export const appTheme = createTheme({
  // ── Palette ───────────────────────────────────────────────────────────────
  palette: {
    mode: 'light',
    primary: {
      main: PRIMARY,
      light: '#818CF8',
      dark: '#3730A3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: SECONDARY,
      light: '#A78BFA',
      dark: '#5B21B6',
      contrastText: '#ffffff',
    },
    success: {
      main: '#16A34A',
      light: '#4ADE80',
      dark: '#15803D',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#D97706',
      light: '#FCD34D',
      dark: '#B45309',
      contrastText: '#ffffff',
    },
    error: {
      main: '#DC2626',
      light: '#F87171',
      dark: '#B91C1C',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0284C7',
      light: '#38BDF8',
      dark: '#0369A1',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
      disabled: '#94A3B8',
    },
    divider: '#E2E8F0',
  },

  // ── Shape ─────────────────────────────────────────────────────────────────
  shape: { borderRadius: 10 },

  // ── Typography ────────────────────────────────────────────────────────────
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'sans-serif',
    ].join(','),
    h1: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em' },
    h2: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.3 },
    h4: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.35 },
    h5: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.4 },
    h6: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.4 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.57 },
    caption: { fontSize: '0.75rem', lineHeight: 1.5, color: '#64748B' },
    overline: { fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' },
    button: { fontWeight: 600, textTransform: 'none' as const, letterSpacing: '0.01em' },
  },

  // ── Component overrides ───────────────────────────────────────────────────
  components: {
    // CssBaseline: import Inter from Google Fonts
    MuiCssBaseline: {
      styleOverrides: `
        * { box-sizing: border-box; }
        body { scroll-behavior: smooth; }
      `,
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8, paddingX: '1rem', fontWeight: 600, minHeight: 36 },
        sizeLarge: { minHeight: 44, fontSize: '0.9375rem' },
        sizeSmall: { minHeight: 30, fontSize: '0.8125rem' },
        containedError: ({ theme }) => ({
          backgroundColor: theme.palette.error.main,
          '&:hover': { backgroundColor: theme.palette.error.dark },
        }),
      },
    },

    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid #E2E8F0',
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        },
      },
    },

    MuiCardContent: {
      styleOverrides: {
        root: { padding: '20px 24px', '&:last-child': { paddingBottom: 20 } },
      },
    },

    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: 'none' },
        outlined: { borderColor: '#E2E8F0' },
      },
    },

    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined' },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '& fieldset': { borderColor: '#CBD5E1' },
          '&:hover fieldset': { borderColor: '#94A3B8' },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: { fontSize: '0.875rem', fontWeight: 500 },
      },
    },

    MuiSelect: {
      defaultProps: { size: 'small' },
    },

    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 500, fontSize: '0.8125rem' },
        colorSuccess: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.success.main, 0.12),
          color: theme.palette.success.dark,
        }),
        colorError: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.error.main, 0.12),
          color: theme.palette.error.dark,
        }),
        colorWarning: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.warning.main, 0.12),
          color: theme.palette.warning.dark,
        }),
        colorInfo: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.info.main, 0.12),
          color: theme.palette.info.dark,
        }),
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: { backgroundColor: '#F8FAFC' },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, fontSize: '0.8125rem', color: '#475569', borderBottom: '1px solid #E2E8F0', paddingY: 10 },
        body: { fontSize: '0.875rem', color: '#0F172A', borderColor: '#F1F5F9' },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td': { border: 0 },
          '&:hover': { backgroundColor: '#F8FAFC' },
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: { fontSize: '1.0625rem', fontWeight: 600, padding: '20px 24px 12px' },
      },
    },

    MuiDialogContent: {
      styleOverrides: {
        root: { padding: '8px 24px 20px' },
      },
    },

    MuiDialogActions: {
      styleOverrides: {
        root: { padding: '12px 24px 20px', gap: 8 },
      },
    },

    MuiTooltip: {
      defaultProps: { arrow: true },
      styleOverrides: {
        tooltip: { fontSize: '0.75rem', borderRadius: 6 },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, height: 6 },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 8, fontSize: '0.875rem' },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: { borderColor: '#E2E8F0' },
      },
    },

    MuiSkeleton: {
      defaultProps: { animation: 'wave' },
      styleOverrides: {
        root: { borderRadius: 6 },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },

    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { borderBottom: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#0F172A' },
      },
    },
  },
});
