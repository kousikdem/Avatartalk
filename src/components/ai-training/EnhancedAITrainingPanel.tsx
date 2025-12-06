import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, MessageCircle, FileText, Hash, Plus, Settings } from 'lucide-react';
import { useAITrainingSettings } from '@/hooks/useAITrainingSettings';
import WelcomeMessageSettings from './WelcomeMessageSettings';
import GlobalDescribeSettings from './GlobalDescribeSettings';
import TopicCard from './TopicCard';
import FollowUpEditor from './FollowUpEditor';

const EnhancedAITrainingPanel: React.FC = () => {
  const {
    settings,
    topics,
    followUps,
    isLoading,
    isSaving,
    updateSettings,
    createTopic,
    updateTopic,
    deleteTopic,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp
  } = useAITrainingSettings();

  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleAddFollowUp = (topicId: string) => {
    setSelectedTopicId(topicId);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="welcome" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="welcome" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Welcome
          </TabsTrigger>
          <TabsTrigger value="describe" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Describe
          </TabsTrigger>
          <TabsTrigger value="topics" className="flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Topics ({topics.length})
          </TabsTrigger>
          <TabsTrigger value="followups" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Follow-ups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="welcome" className="mt-6">
          <WelcomeMessageSettings
            settings={settings}
            onUpdate={updateSettings}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="describe" className="mt-6">
          <GlobalDescribeSettings
            settings={settings}
            onUpdate={updateSettings}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="topics" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => createTopic({ topic_name: 'New Topic' })} disabled={isSaving}>
              <Plus className="w-4 h-4 mr-2" />
              Add Topic
            </Button>
          </div>
          
          {topics.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Hash className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No topics created yet</p>
              <p className="text-sm">Create topics to customize AI responses for different subjects</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {topics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  onUpdate={updateTopic}
                  onDelete={deleteTopic}
                  onAddFollowUp={handleAddFollowUp}
                  followUpCount={followUps.filter(f => f.topic_id === topic.id).length}
                  isSaving={isSaving}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="followups" className="mt-6">
          <FollowUpEditor
            followUps={followUps}
            topicId={selectedTopicId || undefined}
            topicName={topics.find(t => t.id === selectedTopicId)?.topic_name}
            onCreate={createFollowUp}
            onUpdate={updateFollowUp}
            onDelete={deleteFollowUp}
            isSaving={isSaving}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAITrainingPanel;
