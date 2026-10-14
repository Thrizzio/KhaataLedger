import { alpha, createTheme } from '@mui/material/styles';

// ── Brand tokens ─────────────────────────────────────────────────────────────
// A quiet navy foundation keeps dense business screens legible while teal gives
// actions and positive movement a distinct, restrained accent.
const NAVY = '#0B1F3A';
const TEAL = '#0F8A83';

export const appTheme = createTheme({
  // ── Palette ───────────────────────────────────────────────────────────────
  palette: {
    mode: 'light',
    primary: {
      main: NAVY,
      light: '#31577F',
      dark: '#061426',
      contrastText: '#ffffff',
    },
    secondary: {
      main: TEAL,
      light: '#5BC6BB',
      dark: '#0A615D',
      contrastText: '#ffffff',
    },
    success: {
      main: '#15803D',
      light: '#4CAF7A',
      dark: '#0B5C2B',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#B8660B',
      light: '#E4A34B',
      dark: '#824607',
      contrastText: '#ffffff',
    },
    error: {
      main: '#C2413A',
      light: '#E57970',
      dark: '#922F2A',
      contrastText: '#ffffff',
    },
    info: {
      main: '#1769AA',
      light: '#66A9D9',
      dark: '#104A78',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F4F7F8',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#10233F',
      secondary: '#5B6B7E',
      disabled: '#8A99A8',
    },
    divider: '#DDE5EA',
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
    h1: { fontSize: '2rem', fontWeight: 750, lineHeight: 1.18, letterSpacing: '-0.025em' },
    h2: { fontSize: '1.5rem', fontWeight: 750, lineHeight: 1.24, letterSpacing: '-0.018em' },
    h3: { fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.3 },
    h4: { fontSize: '1.125rem', fontWeight: 700, lineHeight: 1.35 },
    h5: { fontSize: '1rem', fontWeight: 700, lineHeight: 1.4 },
    h6: { fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.4 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.55 },
    caption: { fontSize: '0.75rem', lineHeight: 1.5, color: '#5B6B7E' },
    overline: { fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase' },
    button: { fontWeight: 600, textTransform: 'none' as const, letterSpacing: '0.01em' },
  },

  // ── Component overrides ───────────────────────────────────────────────────
  components: {
    // CssBaseline: import Inter from Google Fonts
    MuiCssBaseline: {
      styleOverrides: {
        '*': { boxSizing: 'border-box' },
        'html': { scrollBehavior: 'smooth' },
        'body': { minWidth: 320, backgroundColor: '#F4F7F8' },
        'button, a, input, textarea, select': {
          '&:focus-visible': {
            outline: `3px solid ${alpha(TEAL, 0.42)}`,
            outlineOffset: 2,
          },
        },
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
       styleOverrides: {
        root: { borderRadius: 8, paddingInline: '1rem', fontWeight: 700, minHeight: 38 },
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
          border: '1px solid #DDE5EA',
          borderRadius: 14,
          boxShadow: '0 1px 2px rgba(16,35,63,0.04), 0 8px 24px rgba(16,35,63,0.035)',
        },
      },
    },

    MuiCardContent: {
      styleOverrides: {
        root: { padding: '20px 22px', '&:last-child': { paddingBottom: 20 } },
      },
    },

    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: 'none' },
        outlined: { borderColor: '#DDE5EA' },
      },
    },

    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined' },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
           '& fieldset': { borderColor: '#C8D4DC' },
           '&:hover fieldset': { borderColor: '#8A99A8' },
           '&.Mui-focused fieldset': { borderWidth: 2 },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
         root: { fontSize: '0.875rem', fontWeight: 600 },
      },
    },

    MuiSelect: {
      defaultProps: { size: 'small' },
    },

    MuiChip: {
      styleOverrides: {
         root: { borderRadius: 7, fontWeight: 700, fontSize: '0.8125rem' },
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
         root: { backgroundColor: '#F5F8F9' },
      },
    },

    MuiTableCell: {
      styleOverrides: {
         head: { fontWeight: 700, fontSize: '0.75rem', color: '#4A5C70', borderBottom: '1px solid #DDE5EA', padding: '11px 16px', textTransform: 'uppercase', letterSpacing: '0.045em' },
         body: { fontSize: '0.875rem', color: '#10233F', borderColor: '#EDF2F4', padding: '13px 16px' },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td': { border: 0 },
           '&:hover': { backgroundColor: '#F6FAF9' },
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
         root: { fontSize: '1.0625rem', fontWeight: 750, padding: '22px 24px 12px' },
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
         tooltip: { fontSize: '0.75rem', borderRadius: 6, backgroundColor: NAVY },
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
         root: { borderColor: '#DDE5EA' },
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
         root: { borderBottom: '1px solid #DDE5EA', backgroundColor: '#FFFFFF', color: '#10233F' },
      },
    },
  },
});
