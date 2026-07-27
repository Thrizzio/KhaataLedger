import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Skeleton from '@mui/material/Skeleton';
import type { ReactNode } from 'react';

export interface ColumnDef<T> {
    id: string;
    label: string;
    minWidth?: number;
    align?: 'right' | 'left' | 'center';
    render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
    columns: ColumnDef<T>[];
    rows: T[];
    isLoading: boolean;
    totalElements: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (newPage: number) => void;
    onRowsPerPageChange?: (newLimit: number) => void;
    emptyState?: ReactNode;
    /** Primary key field to use for React keys. Defaults to 'id' */
    keyField?: keyof T;
}

export function DataTable<T extends Record<string, any>>({
    columns,
    rows,
    isLoading,
    totalElements,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    emptyState,
    keyField = 'id' as keyof T,
}: DataTableProps<T>) {
    return (
        <Box sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {columns.map((col) => (
                                <TableCell
                                    key={col.id}
                                    align={col.align}
                                    style={{ minWidth: col.minWidth }}
                                >
                                    {col.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            // Loading skeletons
                            Array.from(new Array(rowsPerPage)).map((_, rowIndex) => (
                                <TableRow key={`skeleton-${rowIndex}`}>
                                    {columns.map((col) => (
                                        <TableCell key={col.id}>
                                            <Skeleton variant="text" width={col.id === 'actions' ? 60 : '80%'} />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : rows.length === 0 ? (
                            // Empty state
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center" sx={{ py: 6, borderBottom: 0 }}>
                                    {emptyState ?? 'No data available'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            // Actual data
                            rows.map((row) => (
                                <TableRow hover role="checkbox" tabIndex={-1} key={String(row[keyField])}>
                                    {columns.map((col) => {
                                        const value = row[col.id];
                                        return (
                                            <TableCell key={col.id} align={col.align}>
                                                {col.render ? col.render(row) : value}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {!isLoading && rows.length > 0 && (
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={totalElements}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => onPageChange(newPage)}
                    onRowsPerPageChange={(e) => {
                        onRowsPerPageChange?.(parseInt(e.target.value, 10));
                        onPageChange(0);
                    }}
                />
            )}
        </Box>
    );
}
