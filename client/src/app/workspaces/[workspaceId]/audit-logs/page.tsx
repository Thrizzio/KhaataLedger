'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  Alert,
  ButtonGroup,
  Button
} from '@mui/material';
import { format } from 'date-fns';
import { auditService } from '../../../../services/audit.service';
import type { AuditLog } from '../../../../types/audit';

export default function AuditLogsPage() {
  const { workspaceId } = useParams() as { workspaceId: string };
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('SALES');

  useEffect(() => {
    fetchLogs(filter);
  }, [workspaceId, filter]);

  const fetchLogs = async (currentFilter: string) => {
    try {
      setLoading(true);
      const entityTypeMap: Record<string, string> = {
        'SALES': 'SALE',
        'INVENTORY': 'INVENTORY_ITEM',
        'CUSTOMERS': 'CUSTOMER',
        'SUPPLIERS': 'SUPPLIER',
        'PURCHASES': 'PURCHASE'
      };
      const res = await auditService.getAuditLogs(workspaceId, entityTypeMap[currentFilter]);
      if (res.data.success) {
        setLogs(res.data.data!);
      } else {
        setError(res.data.message || 'Failed to load audit logs');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'success';
      case 'UPDATE': return 'info';
      case 'DELETE': return 'error';
      default: return 'default';
    }
  };

  const renderChanges = (log: AuditLog) => {
    if (log.action === 'UPDATE' && log.previousValue && log.newValue) {
      const oldKeys = Object.keys(log.previousValue);
      const newKeys = Object.keys(log.newValue);
      const allKeys = Array.from(new Set([...oldKeys, ...newKeys]));
      
      const changes: string[] = [];
      for (const key of allKeys) {
        // Simple comparison
        const oldVal = JSON.stringify(log.previousValue[key]);
        const newVal = JSON.stringify(log.newValue[key]);
        if (oldVal !== newVal) {
          // ignore items changes in simple view, or render them concisely
          if (key === 'items' || key === 'lineItems') {
            changes.push(`Line items updated`);
          } else {
            changes.push(`${key}: ${oldVal} → ${newVal}`);
          }
        }
      }
      return changes.map((c, i) => <div key={i} style={{ fontSize: '0.85rem' }}>{c}</div>);
    } else if (log.action === 'CREATE') {
       return <Typography variant="caption" color="text.secondary">Record Created</Typography>;
    } else if (log.action === 'DELETE') {
       return <Typography variant="caption" color="error">Record Deleted</Typography>;
    }
    return '-';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Audit Logs
      </Typography>

      <Box sx={{ mb: 3 }}>
        <ButtonGroup variant="outlined" aria-label="category filter buttons" sx={{ flexWrap: 'wrap' }}>
          {['SALES', 'INVENTORY', 'CUSTOMERS', 'SUPPLIERS', 'PURCHASES'].map((cat) => (
            <Button 
              key={cat} 
              variant={filter === cat ? 'contained' : 'outlined'}
              onClick={() => setFilter(cat)}
            >
              {cat.charAt(0) + cat.slice(1).toLowerCase()}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={5}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                <TableCell>Date & Time</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Entity / Record</TableCell>
                <TableCell>Changes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    {format(new Date(log.createdAt), 'dd MMM yyyy, h:mm a')}
                  </TableCell>
                  <TableCell>
                    {log.user?.name || log.userId}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={log.action} 
                      color={getActionColor(log.action) as any} 
                      size="small" 
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell>
                    {log.entityTitle ? (
                      <Typography variant="body2">{log.entityTitle}</Typography>
                    ) : log.transaction?.title ? (
                      <Typography variant="body2">{log.transaction.title}</Typography>
                    ) : log.khata ? (
                      <Typography variant="body2">Khata: {log.khata.customerName}</Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">Unknown Entity</Typography>
                    )}
                    {(log.entityType || log.transactionId || log.khataId) && (
                      <Typography variant="caption" color="text.secondary">
                        {log.entityType || (log.transactionId ? 'TRANSACTION' : 'KHATA')}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {renderChanges(log)}
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">No audit logs found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
