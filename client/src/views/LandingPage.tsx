import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import QueryStatsOutlinedIcon from '@mui/icons-material/QueryStatsOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const features = [
    {
        icon: <Inventory2OutlinedIcon />,
        title: 'Inventory that stays current',
        description: 'Keep stock, pricing, and low-stock attention in one dependable place.',
    },
    {
        icon: <PeopleAltOutlinedIcon />,
        title: 'Customer credit, clearly',
        description: 'See customer balances and ledger history without searching through notebooks.',
    },
    {
        icon: <PaymentsOutlinedIcon />,
        title: 'Payments with context',
        description: 'Record money in and out while keeping the related customer or supplier close by.',
    },
    {
        icon: <QueryStatsOutlinedIcon />,
        title: 'Reports for decisions',
        description: 'Turn daily entries into a clearer view of how the business is moving.',
    },
];

const previewNav = ['Dashboard', 'Inventory', 'Customers', 'Suppliers', 'Sales'];

export const LandingPage = () => (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
        <Box
            component="header"
            sx={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(14px)',
            }}
        >
            <Container maxWidth="lg">
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ minHeight: 70 }}>
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                        <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: 'primary.main', color: 'secondary.light', display: 'grid', placeItems: 'center' }}>
                            <StorefrontOutlinedIcon sx={{ fontSize: 20 }} />
                        </Box>
                        <Typography fontWeight={800} letterSpacing="-0.02em">KhaataLedger</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={{ xs: 1.5, sm: 3 }}>
                        <Link href="#features" underline="none" color="text.secondary" fontSize={14} fontWeight={650} sx={{ display: { xs: 'none', sm: 'block' }, '&:hover': { color: 'secondary.main' } }}>
                            Features
                        </Link>
                        <Link href="#workflow" underline="none" color="text.secondary" fontSize={14} fontWeight={650} sx={{ display: { xs: 'none', sm: 'block' }, '&:hover': { color: 'secondary.main' } }}>
                            How it works
                        </Link>
                        <Link href="#workflow" underline="none" color="text.secondary" fontSize={14} fontWeight={650} sx={{ display: { xs: 'none', md: 'block' }, '&:hover': { color: 'secondary.main' } }}>
                            Pricing
                        </Link>
                        <Button href="/login" variant="contained" color="secondary" size="small">Start free</Button>
                    </Stack>
                </Stack>
            </Container>
        </Box>

        <Box component="main">
            <Box
                component="section"
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    pt: { xs: 7, md: 11 },
                    pb: { xs: 7, md: 10 },
                    background: 'linear-gradient(135deg, #F4F7F8 0%, #EAF4F2 100%)',
                    '&:before': { content: '""', position: 'absolute', width: 520, height: 520, borderRadius: '50%', bgcolor: 'rgba(15,138,131,0.08)', right: { xs: -260, md: -120 }, top: -180 },
                }}
            >
                <Container maxWidth="lg" sx={{ position: 'relative' }}>
                    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={{ xs: 6, lg: 8 }} alignItems="center">
                        <Box sx={{ flex: '0 0 43%', maxWidth: { lg: 520 } }}>
                            <Typography variant="overline" color="secondary.main" sx={{ display: 'block', mb: 2 }}>A calmer way to run your shop</Typography>
                            <Typography component="h1" variant="h1" sx={{ fontSize: { xs: '2.45rem', sm: '3.25rem', md: '4rem' }, maxWidth: 600 }}>
                                Your business, in one clear ledger.
                            </Typography>
                            <Typography color="text.secondary" sx={{ mt: 2.5, fontSize: { xs: '1rem', md: '1.1rem' }, maxWidth: 500 }}>
                                Replace scattered notebooks with a focused workspace for inventory, customers, suppliers, sales, and payments.
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 4 }}>
                                <Button href="/login" variant="contained" color="secondary" size="large" endIcon={<ArrowForwardRoundedIcon />}>
                                    Start free
                                </Button>
                                <Button href="/login" variant="outlined" color="primary" size="large">
                                    Book a demo
                                </Button>
                            </Stack>
                            <Stack direction="row" flexWrap="wrap" gap={2.5} sx={{ mt: 4, pt: 2.5, borderTop: '1px solid', borderColor: 'rgba(16,35,63,0.12)' }}>
                                {['Built for daily work', 'Permission-aware', 'GST-ready workflows'].map((item) => (
                                    <Stack direction="row" spacing={0.75} alignItems="center" key={item}>
                                        <CheckCircleRoundedIcon sx={{ color: 'secondary.main', fontSize: 18 }} />
                                        <Typography variant="caption" fontWeight={650}>{item}</Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Box>

                        <Box sx={{ flex: 1, width: '100%', minWidth: 0 }} aria-label="Illustration of the KhaataLedger workspace">
                            <Paper elevation={0} sx={{ p: { xs: 1, sm: 1.5 }, borderRadius: 3, bgcolor: 'primary.main', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 24px 70px rgba(11,31,58,0.20)' }}>
                                <Box sx={{ height: 28, display: 'flex', alignItems: 'center', gap: 0.75, px: 1 }}>
                                    {[0, 1, 2].map((dot) => <Box key={dot} sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.28)' }} />)}
                                    <Box sx={{ ml: 2, height: 16, flex: 1, maxWidth: 250, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.08)' }} />
                                </Box>
                                <Box sx={{ display: 'flex', minHeight: { xs: 310, sm: 390 }, bgcolor: '#F4F7F8', borderRadius: 2, overflow: 'hidden' }}>
                                    <Box sx={{ width: { xs: 112, sm: 175 }, bgcolor: '#102B4A', p: { xs: 1, sm: 1.5 }, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ px: 0.5, py: 1, mb: 1 }}>
                                            <Box sx={{ width: 22, height: 22, borderRadius: 1, bgcolor: 'secondary.main', display: 'grid', placeItems: 'center' }}><StorefrontOutlinedIcon sx={{ color: 'white', fontSize: 14 }} /></Box>
                                            <Typography fontSize={{ xs: 10, sm: 12 }} fontWeight={750} color="white">Khaata</Typography>
                                        </Stack>
                                        {previewNav.map((item, index) => (
                                            <Box key={item} sx={{ px: { xs: 0.75, sm: 1 }, py: { xs: 0.75, sm: 1 }, borderRadius: 1.25, bgcolor: index === 0 ? 'rgba(91,198,187,0.18)' : 'transparent', color: index === 0 ? 'secondary.light' : 'rgba(255,255,255,0.58)', fontSize: { xs: 10, sm: 12 }, fontWeight: 650 }}>
                                                {item}
                                            </Box>
                                        ))}
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0, p: { xs: 1.5, sm: 3 } }}>
                                        <Typography fontSize={{ xs: 15, sm: 20 }} fontWeight={750}>Good morning</Typography>
                                        <Typography fontSize={{ xs: 10, sm: 12 }} color="text.secondary" sx={{ mt: 0.5 }}>A useful view of the work that matters today.</Typography>
                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ mt: 2 }}>
                                            {['Inventory', 'Customers', 'Payments'].map((label, index) => (
                                                <Paper key={label} variant="outlined" sx={{ flex: 1, p: { xs: 1, sm: 1.5 }, borderRadius: 1.5 }}>
                                                    <Typography variant="overline" fontSize={{ xs: 7, sm: 9 }} color="text.secondary">{label}</Typography>
                                                    <Box sx={{ height: 6, mt: 1, width: `${58 + index * 13}%`, borderRadius: 3, bgcolor: index === 1 ? 'secondary.main' : 'primary.light', opacity: 0.75 }} />
                                                </Paper>
                                            ))}
                                        </Stack>
                                        <Paper variant="outlined" sx={{ mt: 1.5, p: { xs: 1.25, sm: 2 }, borderRadius: 1.5 }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                                                <Typography fontSize={{ xs: 11, sm: 13 }} fontWeight={700}>Your operating view</Typography>
                                                <Typography fontSize={{ xs: 9, sm: 11 }} color="secondary.main" fontWeight={700}>Up to date</Typography>
                                            </Stack>
                                            {[['Stock movement', 76], ['Customer follow-ups', 52], ['Supplier payments', 64]].map(([label, width]) => (
                                                <Box key={label} sx={{ mb: 1.25, '&:last-child': { mb: 0 } }}>
                                                    <Typography fontSize={{ xs: 9, sm: 11 }} color="text.secondary">{label}</Typography>
                                                    <Box sx={{ height: 7, borderRadius: 4, bgcolor: '#E5ECEF', mt: 0.5 }}><Box sx={{ width: `${width}%`, height: '100%', borderRadius: 4, bgcolor: 'secondary.main', opacity: 0.75 }} /></Box>
                                                </Box>
                                            ))}
                                        </Paper>
                                    </Box>
                                </Box>
                            </Paper>
                        </Box>
                    </Stack>
                </Container>
            </Box>

            <Box component="section" id="features" sx={{ py: { xs: 7, md: 10 }, bgcolor: 'background.paper' }}>
                <Container maxWidth="lg">
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={3} sx={{ mb: 5 }}>
                        <Box>
                            <Typography variant="overline" color="secondary.main">One connected system</Typography>
                            <Typography variant="h2" sx={{ mt: 1, maxWidth: 500 }}>The everyday details, without the daily clutter.</Typography>
                        </Box>
                        <Typography color="text.secondary" sx={{ maxWidth: 370, alignSelf: 'flex-end' }}>KhaataLedger keeps the practical rhythm of a ledger and gives it the clarity of a modern workspace.</Typography>
                    </Stack>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, borderTop: '1px solid', borderColor: 'divider' }}>
                        {features.map((feature) => (
                            <Box key={feature.title} sx={{ pt: 3, pr: { sm: 3 }, pb: { xs: 3, sm: 0 }, borderBottom: { xs: '1px solid', sm: 'none' }, borderColor: 'divider' }}>
                                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(15,138,131,0.10)', color: 'secondary.main', display: 'grid', placeItems: 'center', mb: 2 }}>{feature.icon}</Box>
                                <Typography fontWeight={750} sx={{ mb: 1 }}>{feature.title}</Typography>
                                <Typography variant="body2" color="text.secondary">{feature.description}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Container>
            </Box>

            <Box component="section" id="workflow" sx={{ py: { xs: 7, md: 9 }, bgcolor: 'primary.main', color: 'common.white' }}>
                <Container maxWidth="md">
                    <Stack alignItems="center" textAlign="center" spacing={2}>
                        <Typography variant="overline" color="secondary.light">Made for momentum</Typography>
                        <Typography variant="h2" color="common.white">Start with the work you already know.</Typography>
                        <Typography color="rgba(255,255,255,0.70)" sx={{ maxWidth: 560 }}>Bring your team into a workspace that makes the next entry, follow-up, and decision easier to find.</Typography>
                        <Button href="/login" variant="contained" color="secondary" size="large" endIcon={<ArrowForwardRoundedIcon />} sx={{ mt: 1 }}>Open KhaataLedger</Button>
                    </Stack>
                </Container>
            </Box>
        </Box>

        <Box component="footer" sx={{ bgcolor: '#061426', color: 'common.white', py: 3 }}>
            <Container maxWidth="lg">
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '2fr repeat(3, 1fr)' }, gap: 3 }}>
                    <Box sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}>
                        <Typography fontWeight={750}>KhaataLedger</Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.58)" sx={{ display: 'block', mt: 1, maxWidth: 230 }}>A clear digital ledger for growing businesses.</Typography>
                    </Box>
                    {[
                        ['Product', ['Product tour', 'Ledger safety', 'GST compliance']],
                        ['Support', ['Merchant support']],
                        ['Legal', ['Terms of service', 'Privacy policy']],
                    ].map(([heading, links]) => (
                        <Box key={heading as string}>
                            <Typography variant="overline" color="rgba(255,255,255,0.58)">{heading}</Typography>
                            <Stack spacing={0.5} sx={{ mt: 1 }}>
                                {(links as string[]).map((label) => <Link key={label} href="#" underline="hover" color="rgba(255,255,255,0.72)" fontSize={12}>{label}</Link>)}
                            </Stack>
                        </Box>
                    ))}
                </Box>
                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.12)' }} />
                <Typography variant="caption" color="rgba(255,255,255,0.48)">© 2024 Khaata Ledger. Handcrafted for Bharat's small businesses.</Typography>
            </Container>
        </Box>
    </Box>
);
