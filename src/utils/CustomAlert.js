import { showSweetAlert } from '../components/SweetAlert';
import { Alert as RNAlert } from 'react-native';

const CustomAlert = {
    alert: (title, message, buttons = [], options = {}) => {
        if (!buttons || buttons.length === 0) {
            showSweetAlert(title, message);
            return;
        }

        if (buttons.length === 1) {
            const btn = buttons[0];
            showSweetAlert(title, message, {
                confirmText: btn.text || 'OK',
                onConfirm: btn.onPress,
            });
            return;
        }

        if (buttons.length >= 2) {
            // Find cancel button (style: 'cancel' or default to first if two)
            let cancelBtn = buttons.find(b => b.style === 'cancel');
            if (!cancelBtn && buttons.length === 2) cancelBtn = buttons[0];

            // Find confirm button
            let confirmBtn = buttons.find(b => b !== cancelBtn) || buttons[1];

            const isDestructive = confirmBtn.style === 'destructive';

            showSweetAlert(title, message, {
                showCancelButton: true,
                cancelText: cancelBtn?.text || 'Cancel',
                onCancel: cancelBtn?.onPress,
                confirmText: confirmBtn?.text || 'OK',
                onConfirm: confirmBtn?.onPress,
                confirmColor: isDestructive ? '#EF4444' : '#7B61FF',
            });
            return;
        }
    }
};

export default CustomAlert;
