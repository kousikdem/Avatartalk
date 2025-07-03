import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
  '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
  '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈',
  '👍', '👎', '👌', '✋', '👋', '🤚', '🖖', '👏', '🙌', '👐',
  '🤝', '🙏', '✍️', '💪', '🦾', '🦵', '🦿', '🦶', '👂', '🦻',
  '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄'
];

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-14 left-0 z-50">
      <Card className="bg-slate-800/95 border-slate-700/50 backdrop-blur-sm p-3 w-64 h-48 overflow-y-auto">
        <div className="grid grid-cols-8 gap-1">
          {emojis.map((emoji, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-slate-700/50 rounded text-lg"
              onClick={() => {
                onEmojiSelect(emoji);
                onClose();
              }}
            >
              {emoji}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default EmojiPicker;