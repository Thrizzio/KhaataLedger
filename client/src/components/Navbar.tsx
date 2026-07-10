"use client";

import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { setAuthData } from '../store/authStore';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const router = useRouter();

  const handleLogout = () => {
    setAuthData(null, null);
    router.replace('/login');
  };

  return (
    <AppBar color="inherit" elevation={0} position="sticky" sx={{ borderBottom: 1, borderColor: 'divider' }}>
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
        <Box sx={{ flexGrow: 1 }}>
          <Typography color="primary" fontWeight={700} variant="h6">
            Khaata Ledger
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Digital ledger workspace
          </Typography>
        </Box>
        <Tooltip title="Logout">
          <IconButton onClick={handleLogout} size="small">
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};
