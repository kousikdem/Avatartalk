-- Create chat conversations table
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  other_user_id UUID NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, other_user_id)
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read BOOLEAN DEFAULT false
);

-- Add chat metrics to user_stats if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_stats' AND column_name = 'total_chats_sent') THEN
    ALTER TABLE public.user_stats ADD COLUMN total_chats_sent INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_stats' AND column_name = 'total_chats_received') THEN
    ALTER TABLE public.user_stats ADD COLUMN total_chats_received INTEGER DEFAULT 0;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_conversations
CREATE POLICY "Users can view their own conversations"
  ON public.chat_conversations FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = other_user_id);

CREATE POLICY "Users can create conversations"
  ON public.chat_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their conversations"
  ON public.chat_conversations FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = other_user_id);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view their messages"
  ON public.chat_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can mark messages as read"
  ON public.chat_messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Function to update chat stats
CREATE OR REPLACE FUNCTION update_chat_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update sender stats
  UPDATE public.user_stats
  SET total_chats_sent = COALESCE(total_chats_sent, 0) + 1,
      updated_at = now()
  WHERE user_id = NEW.sender_id;
  
  -- Update receiver stats
  UPDATE public.user_stats
  SET total_chats_received = COALESCE(total_chats_received, 0) + 1,
      updated_at = now()
  WHERE user_id = NEW.receiver_id;
  
  -- Update conversation timestamp
  UPDATE public.chat_conversations
  SET last_message_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update stats on new message
CREATE TRIGGER update_chat_stats_trigger
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_stats();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON public.chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_other_user_id ON public.chat_conversations(other_user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver_id ON public.chat_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);