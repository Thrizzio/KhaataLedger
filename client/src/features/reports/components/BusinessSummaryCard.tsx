import { Card, CardContent, Typography, Box, Chip, Divider, Stack } from '@mui/material';
import type { BusinessAISummary } from '../types';

interface Props {
    aiSummary?: BusinessAISummary | null;
}

export function BusinessSummaryCard({ aiSummary }: Props) {
    if (!aiSummary) {
        return (
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Business Summary
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Business summary unavailable.
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{ mb: 4 }}>
            <CardContent>
                <Box mb={2}>
                    <Typography variant="h6" color="primary.main" gutterBottom>
                        {aiSummary.headline}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {aiSummary.summary}
                    </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={2}>
                    {aiSummary.highlights && aiSummary.highlights.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>Highlights</Typography>
                            <Stack direction="column" spacing={1}>
                                {aiSummary.highlights.map((item, idx) => (
                                    <Box key={idx} display="flex" alignItems="flex-start" gap={1}>
                                        <Chip size="small" label="+" color="success" variant="outlined" sx={{ flexShrink: 0 }} />
                                        <Typography variant="body2">{item}</Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    )}

                    {aiSummary.warnings && aiSummary.warnings.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>Warnings</Typography>
                            <Stack direction="column" spacing={1}>
                                {aiSummary.warnings.map((item, idx) => (
                                    <Box key={idx} display="flex" alignItems="flex-start" gap={1}>
                                        <Chip size="small" label="!" color="warning" variant="outlined" sx={{ flexShrink: 0 }} />
                                        <Typography variant="body2">{item}</Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    )}

                    {aiSummary.recommendations && aiSummary.recommendations.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>Recommendations</Typography>
                            <Stack direction="column" spacing={1}>
                                {aiSummary.recommendations.map((item, idx) => (
                                    <Box key={idx} display="flex" alignItems="flex-start" gap={1}>
                                        <Chip size="small" label="→" color="primary" variant="outlined" sx={{ flexShrink: 0 }} />
                                        <Typography variant="body2">{item}</Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}
