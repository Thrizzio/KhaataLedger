import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import { useState, type ReactNode } from "react";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar onMenuClick={() => setMobileOpen(true)} />

      <Box sx={{ display: "flex", flexGrow: 1, width: "100%" }}>
        <Sidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minWidth: 0,
            width: { md: `calc(100% - 260px)` },
          }}
        >
          <Toolbar />

          <Container
            maxWidth={false}
            disableGutters
            sx={{
              py: 4,
              px: { xs: 2, sm: 3, md: 4 },
            }}
          >
            {children}
          </Container>
        </Box>
      </Box>
    </Box>
  );
};