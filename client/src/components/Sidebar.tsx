import AssessmentIcon from '@mui/icons-material/Assessment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import HistoryIcon from '@mui/icons-material/History';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SettingsIcon from '@mui/icons-material/Settings';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import { NavLink } from 'react-router-dom';

const drawerWidth = 260;

const navigationItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Customers', path: '/customers', icon: <GroupIcon /> },
  { label: 'Transactions', path: '/transactions', icon: <ReceiptLongIcon /> },
  { label: 'Audit', path: '/audit', icon: <HistoryIcon /> },
  { label: 'Reports', path: '/reports', icon: <AssessmentIcon /> },
  { label: 'Settings', path: '/settings', icon: <SettingsIcon /> },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const drawerContent = (
  <Box>
    <Toolbar />
    <List sx={{ px: 1.5 }}>
      {navigationItems.map((item) => (
        <ListItemButton
          component={NavLink}
          key={item.path}
          to={item.path}
          sx={{
            borderRadius: 3,
            mb: 0.5,
            '&.active': {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '& .MuiListItemIcon-root': {
                color: 'primary.contrastText',
              },
            },
          }}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.label} />
        </ListItemButton>
      ))}
    </List>
  </Box>
);

export const Sidebar = ({ mobileOpen, onClose }: SidebarProps) => (
  <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
    <Drawer
      ModalProps={{ keepMounted: true }}
      onClose={onClose}
      open={mobileOpen}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
      }}
      variant="temporary"
    >
      {drawerContent}
    </Drawer>
    <Drawer
      open
      sx={{
        display: { xs: 'none', md: 'block' },
        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
      }}
      variant="permanent"
    >
      {drawerContent}
    </Drawer>
  </Box>
);
