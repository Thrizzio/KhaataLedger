import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    content: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    isPending?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
    open,
    title,
    content,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDanger = false,
    isPending = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onClose={isPending ? undefined : onCancel} maxWidth="xs" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{content}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} disabled={isPending} color="inherit">
                    {cancelText}
                </Button>
                <Button
                    disabled={isPending}
                    onClick={onConfirm}
                    color={isDanger ? 'error' : 'primary'}
                    variant="contained"
                    startIcon={isPending ? <CircularProgress size={20} color="inherit" /> : undefined}
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
