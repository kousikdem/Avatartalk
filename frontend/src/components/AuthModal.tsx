import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import AuthCard from './auth/AuthCard';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultTab = 'signin' }) => (
  <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
    <DialogContent className="sm:max-w-[440px] max-h-[95vh] overflow-y-auto rounded-3xl p-5 sm:p-7" data-testid="auth-modal">
      <DialogTitle className="sr-only">Sign in to AvatarTalk</DialogTitle>
      <AuthCard defaultTab={defaultTab} onDone={onClose} />
    </DialogContent>
  </Dialog>
);

export default AuthModal;
