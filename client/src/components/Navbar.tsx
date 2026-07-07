import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => (
  <AppBar color="inherit" elevation={0} position="sticky">
    <Toolbar>
      <IconButton
        aria-label="Open navigation"
        color="primary"
        edge="start"
        onClick={onMenuClick}
        sx={{ display: { md: 'none' }, mr: 1 }}
      >
        <MenuIcon />
      </IconButton>
      <Box>
        <Typography color="primary" fontWeight={700} variant="h6">
          Khaata Ledger
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Digital ledger workspace
        </Typography>
      </Box>
    </Toolbar>
  </AppBar>
);
