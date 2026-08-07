import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import StorefrontIcon from '@mui/icons-material/Storefront';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import GroupIcon from '@mui/icons-material/Group';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ShowChartIcon from '@mui/icons-material/ShowChart';

export const LandingPage = () => {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: "'Inter', sans-serif",
                bgcolor: '#f8f9ff',
            }}
        >
            {/* Header */}
            <Box
                component="header"
                sx={{
                    borderBottom: '1px solid #e5e7eb',
                    bgcolor: '#ffffff',
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                    py: 2,
                }}
            >
                <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={700} color="#111827">
                        Khaata Ledger
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', '@media (max-width: 600px)': { display: 'none' } }}>
                        <Link href="#" underline="none" color="#4b5563" fontWeight={500} sx={{ '&:hover': { color: '#0f766e' } }}>
                            Features
                        </Link>
                        <Link href="#" underline="none" color="#4b5563" fontWeight={500} sx={{ '&:hover': { color: '#0f766e' } }}>
                            Pricing
                        </Link>
                        <Button
                            href="/login"
                            variant="contained"
                            sx={{
                                bgcolor: '#0f766e',
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3,
                                '&:hover': { bgcolor: '#0d635c' },
                            }}
                        >
                            Start Free
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Hero Section */}
                <Container maxWidth="xl" sx={{ pt: 12, pb: 8, flexGrow: 1 }}>
                    <Grid container spacing={8} alignItems="center">
                        {/* Left Column (Copy) */}
                        <Grid item xs={12} lg={5} sx={{ zIndex: 10 }}>
                            <Typography
                                variant="h2"
                                component="h1"
                                fontWeight={800}
                                color="#111827"
                                sx={{
                                    mb: 3,
                                    fontSize: { xs: '2.5rem', md: '3rem', lg: '3.5rem' },
                                    lineHeight: 1.1,
                                    letterSpacing: '-0.04em',
                                }}
                            >
                                Run your entire shop from one ledger.
                            </Typography>
                            <Typography variant="body1" color="#4b5563" sx={{ mb: 5, fontSize: '1.125rem', lineHeight: 1.6 }}>
                                Ditch the notebooks. Track inventory, manage customer credit, and record daily sales with a digital ledger built for India's pragmatic business owners.
                            </Typography>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 6 }}>
                                <Button
                                    href="/login"
                                    variant="contained"
                                    endIcon={<ArrowForwardIcon />}
                                    sx={{
                                        bgcolor: '#0f766e',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '1rem',
                                        boxShadow: '2px 2px 0px rgba(0,0,0,0.8)',
                                        border: '1px solid transparent',
                                        '&:hover': { bgcolor: '#0d635c', boxShadow: '2px 2px 0px rgba(0,0,0,1)' },
                                    }}
                                >
                                    Start Free
                                </Button>
                                <Button
                                    href="/login"
                                    variant="outlined"
                                    sx={{
                                        color: '#111827',
                                        borderColor: '#d1d5db',
                                        bgcolor: '#ffffff',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '1rem',
                                        '&:hover': { bgcolor: '#f3f4f6', borderColor: '#9ca3af' },
                                    }}
                                >
                                    Book a Demo
                                </Button>
                            </Stack>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, pt: 4, borderTop: '1px solid #e5e7eb' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#4b5563', fontSize: '0.875rem', fontWeight: 500 }}>
                                    <CheckCircleOutlineIcon sx={{ color: '#0f766e', fontSize: 20 }} />
                                    GST Ready
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#4b5563', fontSize: '0.875rem', fontWeight: 500 }}>
                                    <MoneyOffIcon sx={{ color: '#0f766e', fontSize: 20 }} />
                                    No setup fees
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#4b5563', fontSize: '0.875rem', fontWeight: 500 }}>
                                    <StorefrontIcon sx={{ color: '#0f766e', fontSize: 20 }} />
                                    Used by local retailers
                                </Box>
                            </Box>
                        </Grid>

                        {/* Right Column (Mockup) */}
                        <Grid item xs={12} lg={7} sx={{ position: 'relative' }}>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    inset: -16,
                                    background: 'linear-gradient(to top right, #d9e3f6, #e6eeff)',
                                    borderRadius: 4,
                                    opacity: 0.5,
                                    transform: 'rotate(1deg)',
                                }}
                            />
                            <Paper
                                elevation={6}
                                sx={{
                                    position: 'relative',
                                    width: '100%',
                                    borderRadius: 3,
                                    border: '1px solid #e5e7eb',
                                    bgcolor: '#ffffff',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                {/* Mockup Browser Header */}
                                <Box sx={{ height: 40, borderBottom: '1px solid #e5e7eb', bgcolor: '#f9fafb', display: 'flex', alignItems: 'center', px: 2, gap: 1.5 }}>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#d1d5db' }} />
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#d1d5db' }} />
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#d1d5db' }} />
                                    </Box>
                                    <Box sx={{ mx: 'auto', width: '50%', height: 24, bgcolor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography fontSize={11} color="#6b7280" fontFamily="monospace">
                                            app.khaataledger.in
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Dashboard Area */}
                                <Box sx={{ display: 'flex', height: 500, bgcolor: '#f8f9ff' }}>
                                    {/* Sidebar */}
                                    <Box sx={{ width: 220, borderRight: '1px solid #e5e7eb', bgcolor: '#ffffff', display: 'flex', flexDirection: 'column', p: 2, gap: 1 }}>
                                        <Typography variant="h6" fontWeight={800} color="#111827" sx={{ mb: 2 }}>
                                            Khaata
                                        </Typography>

                                        <Box sx={{ px: 2, py: 1, bgcolor: '#eff4ff', borderRadius: 1, color: '#0f766e', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1.5, borderLeft: '3px solid #0f766e' }}>
                                            <DashboardIcon fontSize="small" /> Dashboard
                                        </Box>
                                        <Box sx={{ px: 2, py: 1, color: '#4b5563', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Inventory2Icon fontSize="small" /> Inventory
                                        </Box>
                                        <Box sx={{ px: 2, py: 1, color: '#4b5563', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <GroupIcon fontSize="small" /> Customers
                                        </Box>
                                        <Box sx={{ px: 2, py: 1, color: '#4b5563', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <LocalShippingIcon fontSize="small" /> Suppliers
                                        </Box>
                                        <Box sx={{ px: 2, py: 1, color: '#4b5563', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <ShoppingCartIcon fontSize="small" /> Purchases
                                        </Box>
                                        <Box sx={{ px: 2, py: 1, color: '#4b5563', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <ReceiptLongIcon fontSize="small" /> Sales
                                        </Box>
                                    </Box>

                                    {/* Main Content Area */}
                                    <Box sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', gap: 3, overflow: 'hidden' }}>
                                        {/* Top Cards */}
                                        <Grid container spacing={2}>
                                            <Grid item xs={3}>
                                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
                                                    <Typography fontSize={11} fontWeight={600} color="#6b7280" textTransform="uppercase" letterSpacing={0.5}>Today's Sales</Typography>
                                                    <Typography fontSize={20} fontWeight={700} color="#111827" fontFamily="monospace" mt={0.5}>₹14,250</Typography>
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
                                                    <Typography fontSize={11} fontWeight={600} color="#6b7280" textTransform="uppercase" letterSpacing={0.5}>Outstanding Credit</Typography>
                                                    <Typography fontSize={20} fontWeight={700} color="#dc2626" fontFamily="monospace" mt={0.5}>₹42,100</Typography>
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
                                                    <Typography fontSize={11} fontWeight={600} color="#6b7280" textTransform="uppercase" letterSpacing={0.5}>Supplier Pending</Typography>
                                                    <Typography fontSize={20} fontWeight={700} color="#111827" fontFamily="monospace" mt={0.5}>₹18,500</Typography>
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5, borderTop: '3px solid #0f766e' }}>
                                                    <Typography fontSize={11} fontWeight={600} color="#6b7280" textTransform="uppercase" letterSpacing={0.5}>Low Stock</Typography>
                                                    <Typography fontSize={20} fontWeight={700} color="#0f766e" fontFamily="monospace" mt={0.5}>12 Items</Typography>
                                                </Paper>
                                            </Grid>
                                        </Grid>

                                        {/* Chart Area */}
                                        <Paper variant="outlined" sx={{ flexGrow: 1, borderRadius: 1.5, p: 2, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                            <Typography fontSize={14} fontWeight={600} color="#111827" mb={2}>Weekly Sales Overview</Typography>
                                            <Box sx={{ borderBottom: '1px solid #e5e7eb', flexGrow: 1 }} />

                                            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, px: 2, borderBottom: '1px solid #e5e7eb', opacity: 0.8 }}>
                                                <Box sx={{ width: 32, height: 48, bgcolor: '#e5e7eb', borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
                                                <Box sx={{ width: 32, height: 80, bgcolor: '#e5e7eb', borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
                                                <Box sx={{ width: 32, height: 64, bgcolor: '#e5e7eb', borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
                                                <Box sx={{ width: 32, height: 110, bgcolor: '#69b1a7', borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
                                                <Box sx={{ width: 32, height: 90, bgcolor: '#e5e7eb', borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
                                                <Box sx={{ width: 32, height: 40, bgcolor: '#e5e7eb', borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
                                                <Box sx={{ width: 32, height: 56, bgcolor: '#e5e7eb', borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
                                            </Box>

                                            <Box sx={{ position: 'absolute', top: 60, right: 60, display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                                <ShowChartIcon sx={{ color: '#0f766e', fontSize: 18 }} />
                                                <Typography fontSize={11} fontWeight={600} color="#0f766e" fontStyle="italic" letterSpacing={0.5}>Festival surge</Typography>
                                            </Box>
                                        </Paper>

                                        {/* Activity List */}
                                        <Paper variant="outlined" sx={{ borderRadius: 1.5, display: 'flex', flexDirection: 'column' }}>
                                            <Box sx={{ p: 1.5, borderBottom: '1px solid #e5e7eb', bgcolor: '#f9fafb' }}>
                                                <Typography fontSize={11} fontWeight={600} color="#111827" textTransform="uppercase" letterSpacing={0.5}>Recent Activity</Typography>
                                            </Box>
                                            <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e5e7eb', pb: 1, fontFamily: 'monospace', fontSize: 12, color: '#4b5563' }}>
                                                    <Box width="20%">INV-001</Box>
                                                    <Box width="50%">Ramesh Hardware</Box>
                                                    <Box width="30%" textAlign="right" color="#111827">₹2,400</Box>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e5e7eb', pb: 1, fontFamily: 'monospace', fontSize: 12, color: '#4b5563' }}>
                                                    <Box width="20%">REC-892</Box>
                                                    <Box width="50%">Payment Received</Box>
                                                    <Box width="30%" textAlign="right" color="#0f766e">+ ₹1,500</Box>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: 12, color: '#4b5563' }}>
                                                    <Box width="20%">INV-002</Box>
                                                    <Box width="50%">Suresh Enterprises</Box>
                                                    <Box width="30%" textAlign="right" color="#111827">₹8,900</Box>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>

                {/* Feature Grid Below Fold */}
                <Box sx={{ bgcolor: '#ffffff', borderTop: '1px solid #e5e7eb', py: 8 }}>
                    <Container maxWidth="xl">
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={6} lg={3}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: 1.5, border: '1px solid #e5e7eb', bgcolor: '#f4f6fb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Inventory2Icon sx={{ color: '#0f766e' }} />
                                    </Box>
                                    <Typography variant="h6" fontWeight={700} color="#111827" fontSize={18}>
                                        Inventory
                                    </Typography>
                                    <Typography variant="body2" color="#4b5563" lineHeight={1.6}>
                                        Know exactly what's in stock. Set low stock alerts and manage product variations.
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6} lg={3} sx={{ borderLeft: { lg: '1px solid #e5e7eb' }, pl: { lg: 4 } }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: 1.5, border: '1px solid #e5e7eb', bgcolor: '#f4f6fb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <AccountBalanceWalletIcon sx={{ color: '#0f766e' }} />
                                    </Box>
                                    <Typography variant="h6" fontWeight={700} color="#111827" fontSize={18}>
                                        Credit Tracking
                                    </Typography>
                                    <Typography variant="body2" color="#4b5563" lineHeight={1.6}>
                                        See who owes money at a glance. Send gentle payment reminders via WhatsApp.
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6} lg={3} sx={{ borderLeft: { lg: '1px solid #e5e7eb' }, pl: { lg: 4 } }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: 1.5, border: '1px solid #e5e7eb', bgcolor: '#f4f6fb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <LocalShippingIcon sx={{ color: '#0f766e' }} />
                                    </Box>
                                    <Typography variant="h6" fontWeight={700} color="#111827" fontSize={18}>
                                        Supplier Payments
                                    </Typography>
                                    <Typography variant="body2" color="#4b5563" lineHeight={1.6}>
                                        Track what you owe to distributors and manage purchase orders seamlessly.
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6} lg={3} sx={{ borderLeft: { lg: '1px solid #e5e7eb' }, pl: { lg: 4 } }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: 1.5, border: '1px solid #e5e7eb', bgcolor: '#f4f6fb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <QueryStatsIcon sx={{ color: '#0f766e' }} />
                                    </Box>
                                    <Typography variant="h6" fontWeight={700} color="#111827" fontSize={18}>
                                        Reports
                                    </Typography>
                                    <Typography variant="body2" color="#4b5563" lineHeight={1.6}>
                                        Understand your money sources. Generate instant daily P&L and GST-ready export files.
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>
            </Box>

            {/* Footer */}
            <Box component="footer" sx={{ bgcolor: '#e6eeff', borderTop: '1px solid #d9e3f6', py: 6 }}>
                <Container maxWidth="xl">
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6} lg={4}>
                            <Typography variant="h6" fontWeight={700} color="#111827" mb={1}>
                                Khaata Ledger
                            </Typography>
                            <Typography variant="body2" color="#4b5563">
                                &copy; 2024 Khaata Ledger. Handcrafted for Bharat's Small Businesses.
                            </Typography>
                        </Grid>
                        <Grid item xs={6} md={3} lg={2}>
                            <Typography fontSize={11} fontWeight={600} color="#111827" mb={2} textTransform="uppercase" letterSpacing={1}>Product</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Link href="#" underline="hover" color="#4b5563" fontSize={14}>Product Tour</Link>
                                <Link href="#" underline="hover" color="#4b5563" fontSize={14}>Ledger Safety</Link>
                                <Link href="#" underline="hover" color="#4b5563" fontSize={14}>GST Compliance</Link>
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={3} lg={2}>
                            <Typography fontSize={11} fontWeight={600} color="#111827" mb={2} textTransform="uppercase" letterSpacing={1}>Support</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Link href="#" underline="hover" color="#4b5563" fontSize={14}>Merchant Support</Link>
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={3} lg={2}>
                            <Typography fontSize={11} fontWeight={600} color="#111827" mb={2} textTransform="uppercase" letterSpacing={1}>Legal</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Link href="#" underline="hover" color="#4b5563" fontSize={14}>Terms of Service</Link>
                                <Link href="#" underline="hover" color="#4b5563" fontSize={14}>Privacy Policy</Link>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
};
