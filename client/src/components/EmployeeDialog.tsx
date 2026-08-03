import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Card from '@mui/material/Card';
import { useForm } from 'react-hook-form';
import { Permission } from '../types/auth';
import type { CreateEmployeePayload, Employee } from '../types/workspace';

interface EmployeeDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: CreateEmployeePayload & { permissions: string[] }) => void;
    isPending: boolean;
    initialData?: Employee | null;
}

export const PERMISSION_GROUPS = [
    {
        title: 'Dashboard',
        permissions: [
            { key: Permission.DASHBOARD_VIEW, label: 'View Dashboard' },
        ],
    },
    {
        title: 'Inventory',
        permissions: [
            { key: Permission.INVENTORY_VIEW, label: 'View Inventory' },
            { key: Permission.INVENTORY_CREATE, label: 'Create Inventory Items' },
            { key: Permission.INVENTORY_EDIT, label: 'Edit Inventory Items' },
            { key: Permission.INVENTORY_DELETE, label: 'Delete Inventory Items' },
        ],
    },
    {
        title: 'Customers',
        permissions: [
            { key: Permission.CUSTOMERS_VIEW, label: 'View Customers' },
            { key: Permission.CUSTOMERS_CREATE, label: 'Create Customers' },
            { key: Permission.CUSTOMERS_EDIT, label: 'Edit Customers' },
            { key: Permission.CUSTOMERS_DELETE, label: 'Delete Customers' },
        ],
    },
    {
        title: 'Suppliers',
        permissions: [
            { key: Permission.SUPPLIERS_VIEW, label: 'View Suppliers' },
            { key: Permission.SUPPLIERS_CREATE, label: 'Create Suppliers' },
            { key: Permission.SUPPLIERS_EDIT, label: 'Edit Suppliers' },
            { key: Permission.SUPPLIERS_DELETE, label: 'Delete Suppliers' },
        ],
    },
    {
        title: 'Purchases',
        permissions: [
            { key: Permission.PURCHASES_VIEW, label: 'View Purchases' },
            { key: Permission.PURCHASES_RECORD, label: 'Record Purchases' },
            { key: Permission.PURCHASES_CANCEL, label: 'Cancel Purchases' },
        ],
    },
    {
        title: 'Sales',
        permissions: [
            { key: Permission.SALES_VIEW, label: 'View Sales' },
            { key: Permission.SALES_RECORD, label: 'Record Sales' },
            { key: Permission.SALES_CANCEL, label: 'Cancel Sales' },
            { key: Permission.SALES_VIEW_DETAILS, label: 'View Sale Details' },
        ],
    },
    {
        title: 'Payments',
        permissions: [
            { key: Permission.PAYMENTS_CUSTOMER_VIEW, label: 'View Customer Payments' },
            { key: Permission.PAYMENTS_CUSTOMER_RECORD, label: 'Record Customer Payments' },
            { key: Permission.PAYMENTS_SUPPLIER_VIEW, label: 'View Supplier Payments' },
            { key: Permission.PAYMENTS_SUPPLIER_RECORD, label: 'Record Supplier Payments' },
        ],
    },
    {
        title: 'Reports',
        permissions: [
            { key: Permission.REPORTS_VIEW, label: 'View Reports' },
        ],
    },
    {
        title: 'Employees',
        permissions: [
            { key: Permission.EMPLOYEES_VIEW, label: 'View Employees' },
        ],
    },
    {
        title: 'Settings',
        permissions: [
            { key: Permission.SETTINGS_VIEW, label: 'View Settings' },
        ],
    },
];

const DEFAULT_PERMISSIONS = [
    Permission.DASHBOARD_VIEW,
    Permission.INVENTORY_VIEW,
    Permission.SALES_VIEW,
    Permission.SALES_RECORD,
    Permission.CUSTOMERS_VIEW
];

export const EmployeeDialog = ({ open, onClose, onSubmit, isPending, initialData }: EmployeeDialogProps) => {
    const isEdit = !!initialData;
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateEmployeePayload>({
        defaultValues: { name: '', email: '', password: '' },
    });
    
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(DEFAULT_PERMISSIONS);

    useEffect(() => {
        if (open) {
            if (isEdit && initialData) {
                reset({
                    name: initialData.name,
                    email: initialData.email,
                    password: '', // Leave password empty for edit unless they want to reset it? Wait, edit might not support password update right now.
                });
                setSelectedPermissions(initialData.permissions || []);
            } else {
                reset({ name: '', email: '', password: '' });
                setSelectedPermissions(DEFAULT_PERMISSIONS);
            }
        }
    }, [open, isEdit, initialData, reset]);

    const togglePermission = (permissionKey: string) => {
        setSelectedPermissions((prev) =>
            prev.includes(permissionKey)
                ? prev.filter((p) => p !== permissionKey)
                : [...prev, permissionKey]
        );
    };

    const handleFormSubmit = (values: CreateEmployeePayload) => {
        onSubmit({ ...values, permissions: selectedPermissions });
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle fontWeight={700}>{isEdit ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
            <Divider />
            <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
                <DialogContent>
                    <Stack spacing={3}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            <TextField
                                label="Full Name"
                                fullWidth
                                {...register('name', { required: 'Name is required' })}
                                error={Boolean(errors.name)}
                                helperText={errors.name?.message}
                                disabled={isPending}
                            />
                            <TextField
                                label="Email Address"
                                type="email"
                                fullWidth
                                {...register('email', { required: 'Email is required' })}
                                error={Boolean(errors.email)}
                                helperText={errors.email?.message}
                                disabled={isPending || isEdit}
                            />
                            {!isEdit && (
                                <TextField
                                    label="Temporary Password"
                                    type="password"
                                    fullWidth
                                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                                    error={Boolean(errors.password)}
                                    helperText={errors.password?.message || 'Employee will use this to log in.'}
                                    disabled={isPending}
                                />
                            )}
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={600} mb={2}>
                                Permissions
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                {PERMISSION_GROUPS.map((group) => (
                                    <Card key={group.title} sx={{ p: 2, borderRadius: 2 }} variant="outlined">
                                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                            {group.title}
                                        </Typography>
                                        <Divider sx={{ mb: 1.5 }} />
                                        <Stack spacing={0.5}>
                                            {group.permissions.map((perm) => (
                                                <FormControlLabel
                                                    key={perm.key}
                                                    control={
                                                        <Switch
                                                            checked={selectedPermissions.includes(perm.key)}
                                                            onChange={() => togglePermission(perm.key)}
                                                            disabled={isPending}
                                                            size="small"
                                                            color="primary"
                                                        />
                                                    }
                                                    label={<Typography variant="body2">{perm.label}</Typography>}
                                                />
                                            ))}
                                        </Stack>
                                    </Card>
                                ))}
                            </Box>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={handleClose} color="inherit" disabled={isPending}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isPending}
                    >
                        {isPending ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Employee')}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};
