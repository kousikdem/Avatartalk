import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCoquiTTS } from '@/hooks/useCoquiTTS';

interface TalkToMeButtonProps {
  profileName: string;
  visitorName?: string;
  onStartConversation: () => void;
  disabled?: boolean;
  className?: string;
}

export const TalkToMeButton = ({
  profileName,
  visitorName = 'there',
  onStartConversation,
  disabled = false,
  className = ''
}: TalkToMeButtonProps) => {
  const [isGreeting, setIsGreeting] = useState(false);
  const { synthesizeSpeech, isLoading } = useCoquiTTS();

  const handleClick = async () => {
    if (disabled || isGreeting) return;
    
    setIsGreeting(true);
    
    try {
      // Generate personalized greeting
      const greeting = `Hi ${visitorName}! How can I help you today?`;
      
      // Speak the greeting
      await synthesizeSpeech(greeting, {
        voice: 'neural',
        speed: 1.0,
        language: 'en-US'
      });
      
      // Start the conversation
      onStartConversation();
    } catch (error) {
      console.error('Error with voice greeting:', error);
      // Still start conversation even if voice fails
      onStartConversation();
    } finally {
      setIsGreeting(false);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      <Button
        onClick={handleClick}
        disabled={disabled || isGreeting || isLoading}
        className={`
          relative overflow-hidden
          bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 
          hover:from-blue-700 hover:via-purple-700 hover:to-pink-700
          text-white font-semibold
          shadow-lg hover:shadow-xl
          transition-all duration-300
          ${className}
        `}
      >
        <AnimatePresence mode="wait">
          {isGreeting || isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Greeting...</span>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Mic className="w-4 h-4" />
              <span>Talk to Me</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse animation ring */}
        <span className="absolute inset-0 rounded-lg">
          <span className="absolute inset-0 rounded-lg animate-ping bg-purple-400/20" />
        </span>
      </Button>
    </motion.div>
  );
};
