"use client";

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SearchIcon from '@mui/icons-material/Search';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageShell } from './PageShell';
import { type AuditLog, type AuditAction } from '../types/audit';
import { auditService } from '../services/audit.service';

interface AuditPageProps {
  workspaceId?: string;
}

const formatAmount = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const formatFullDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatRelative = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfDay.getTime()) / 86_400_000);
  const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  if (diffDays === 0) return `Today ${time}`;
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const ACTION_META: Record<AuditAction, { label: string; color: 'success' | 'warning' | 'error'; Icon: ReactElement['type'] }> = {
  CREATE: { label: 'Created Transaction', color: 'success', Icon: AddCircleOutlineIcon },
  UPDATE: { label: 'Updated Transaction', color: 'warning', Icon: EditOutlinedIcon },
  DELETE: { label: 'Deleted Transaction', color: 'error', Icon: DeleteOutlineIcon },
};

// Displayable snapshot fields, in render order.
const FIELDS: { key: string; label: string; format: (v: unknown) => string }[] = [
  { key: 'title', label: 'Title', format: (v) => (v ? String(v) : '—') },
  { key: 'amount', label: 'Amount', format: (v) => formatAmount(Number(v ?? 0)) },
  { key: 'type', label: 'Type', format: (v) => (v === 'INCOME' ? 'Income' : v === 'EXPENSE' ? 'Expense' : '—') },
  { key: 'description', label: 'Description', format: (v) => (v ? String(v) : '—') },
  { key: 'transactionDate', label: 'Transaction Date', format: (v) => formatFullDate(String(v)) },
];

type Row = { label: string; old: string | null; new: string; changed: boolean };

const buildRows = (log: AuditLog): Row[] => {
  const next = log.newValue ?? {};
  const prev = log.previousValue;

  if (log.action === 'CREATE') {
    return FIELDS.map((f) => ({ label: f.label, old: null, new: f.format(next[f.key]), changed: false }));
  }

  const changed = FIELDS.filter((f) => String(prev?.[f.key] ?? '') !== String(next[f.key] ?? '')).map(
    (f) => ({ label: f.label, old: prev ? f.format(prev[f.key]) : '—', new: f.format(next[f.key]), changed: true }),
  );

  if (log.action === 'DELETE') {
    return [{ label: 'Status', old: 'Active', new: 'Deleted', changed: true }, ...changed];
  }

  return changed;
};

export const AuditPage = ({ workspaceId = '' }: AuditPageProps) => {
  const [selected, setSelected] = useState<AuditLog | null>(null);
  const [search, setSearch] = useState('');

  const { data: logs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ['audit', workspaceId],
    queryFn: () => auditService.getAuditLogs(workspaceId).then((r) => r.data.data ?? []),
    enabled: Boolean(workspaceId),
  });

  const query = search.trim().toLowerCase();
  const filtered = query
    ? logs.filter(
        (l) =>
          (l.transaction?.title ?? '').toLowerCase().includes(query) ||
          (l.user?.name ?? '').toLowerCase().includes(query),
      )
    : logs;

  return (
    <PageShell title="Audit Log" workspaceId={workspaceId}>
      <Stack spacing={3}>
        <TextField
          placeholder="Search audit logs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          fullWidth
          sx={{ maxWidth: 420 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : filtered.length === 0 ? (
          <Paper sx={{ p: 4, borderRadius: 3 }} variant="outlined">
            <Typography color="text.secondary" textAlign="center">
              {logs.length === 0 ? 'No audit activity for this workspace yet.' : 'No audit logs match your search.'}
            </Typography>
          </Paper>
        ) : (
          filtered.map((log) => {
            const meta = ACTION_META[log.action];
            const Icon = meta.Icon;
            return (
              <Card key={log.id} variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: `${meta.color}.light`, color: `${meta.color}.main`, flexShrink: 0 }}>
                      <Icon fontSize="small" />
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography fontWeight={600} noWrap>
                        {meta.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {log.transaction?.title ?? 'Transaction'}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {log.user?.name ?? '—'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatRelative(log.createdAt)}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      sx={{ textTransform: 'none', flexShrink: 0 }}
                      onClick={() => setSelected(log)}
                    >
                      View Details
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            );
          })
        )}
      </Stack>

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="xs" fullWidth>
        {selected &&
          (() => {
            const meta = ACTION_META[selected.action];
            const Icon = meta.Icon;
            const rows = buildRows(selected);
            return (
              <>
                <DialogTitle sx={{ pb: 1 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: `${meta.color}.light`, color: `${meta.color}.main`, width: 34, height: 34, flexShrink: 0 }}>
                      <Icon fontSize="small" />
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={700} fontSize={16} noWrap>
                        {meta.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {selected.transaction?.title ?? 'Transaction'}
                      </Typography>
                    </Box>
                  </Stack>
                </DialogTitle>
                <DialogContent dividers>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Edited by
                      </Typography>
                      <Typography fontWeight={600}>{selected.user?.name ?? '—'}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatFullDate(selected.createdAt)}
                    </Typography>
                    <Divider />
                    {rows.length === 0 ? (
                      <Typography color="text.secondary" variant="body2">
                        No field changes recorded.
                      </Typography>
                    ) : (
                      <Stack spacing={1.75}>
                        {rows.map((row) => (
                          <Box key={row.label}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ textTransform: 'uppercase', letterSpacing: 0.4 }}
                            >
                              {row.label}
                            </Typography>
                            {row.changed ? (
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography sx={{ textDecoration: 'line-through', color: 'text.disabled' }}>
                                  {row.old}
                                </Typography>
                                <ArrowDownwardIcon fontSize="small" color="error" />
                                <Typography fontWeight={600}>{row.new}</Typography>
                              </Stack>
                            ) : (
                              <Typography fontWeight={600}>{row.new}</Typography>
                            )}
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setSelected(null)}>Close</Button>
                </DialogActions>
              </>
            );
          })()}
      </Dialog>
    </PageShell>
  );
};
