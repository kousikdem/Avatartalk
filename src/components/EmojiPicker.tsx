import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const emojiCategories = {
  'Smileys & People': [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣'
  ],
  'Gestures & Body': [
    '👍', '👎', '👌', '✋', '👋', '🤚', '🖖', '👏', '🙌', '👐',
    '🤝', '🙏', '✍️', '💪', '🦾', '🦵', '🦿', '🦶', '👂', '🦻',
    '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄'
  ],
  'Objects & Symbols': [
    '💖', '💕', '💞', '💓', '💗', '💝', '💘', '💟', '♥️', '💔',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🤍', '🖤', '🤎', '💯',
    '⭐', '🌟', '✨', '🔥', '💫', '🌈', '🎉', '🎊', '🎁', '🎈'
  ],
  'Nature & Food': [
    '🌸', '🌺', '🌻', '🌹', '🌷', '🌼', '🌵', '🌲', '🌳', '🍎',
    '🍊', '🍋', '🍌', '🍇', '🍓', '🫐', '🍈', '🍉', '🍑', '🍒',
    '🥝', '🍍', '🥭', '🍑', '🍯', '🍰', '🎂', '🧁', '🍪', '🍫'
  ]
};

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('Smileys & People');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredEmojis = searchTerm 
    ? Object.values(emojiCategories).flat().filter(emoji => 
        emoji.includes(searchTerm) || 
        Object.keys(emojiCategories).some(category => 
          category.toLowerCase().includes(searchTerm.toLowerCase()) &&
          emojiCategories[category as keyof typeof emojiCategories].includes(emoji)
        )
      )
    : emojiCategories[activeCategory as keyof typeof emojiCategories];

  return (
    <div className="absolute bottom-16 left-0 z-50 w-80">
      <Card className="bg-slate-800/95 border-slate-700/50 backdrop-blur-xl shadow-2xl shadow-slate-900/50 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/30">
          <h3 className="text-sm font-semibold text-white">Select Emoji</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-slate-700/50 rounded-full text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-700/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search emojis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Categories */}
        {!searchTerm && (
          <div className="p-2 border-b border-slate-700/30">
            <div className="flex flex-wrap gap-1">
              {Object.keys(emojiCategories).map((category) => (
                <Button
                  key={category}
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveCategory(category)}
                  className={`text-xs px-2 py-1 h-auto rounded-md transition-all duration-200 ${
                    activeCategory === category
                      ? 'bg-blue-600/80 text-white border border-blue-500/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {category.split(' ')[0]}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Emoji Grid */}
        <div className="p-3 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
          <div className="grid grid-cols-8 gap-1">
            {filteredEmojis.map((emoji, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 hover:bg-slate-700/50 rounded-lg text-xl transition-all duration-200 hover:scale-110"
                onClick={() => {
                  onEmojiSelect(emoji);
                  onClose();
                }}
                title={`Add ${emoji} to message`}
              >
                {emoji}
              </Button>
            ))}
          </div>
          
          {filteredEmojis.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm">No emojis found</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EmojiPicker;