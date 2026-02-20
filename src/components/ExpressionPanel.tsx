
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smile, Frown, Meh, Heart, Zap, AlertTriangle, Laugh, Angry } from 'lucide-react';

interface ExpressionPanelProps {
  currentExpression: string;
  onExpressionSelect: (expression: string) => void;
}

const ExpressionPanel: React.FC<ExpressionPanelProps> = ({ currentExpression, onExpressionSelect }) => {
  const expressions = [
    { id: 'neutral', name: 'Neutral', icon: Meh, color: 'bg-gray-500', description: 'Calm and composed' },
    { id: 'smiling', name: 'Happy', icon: Smile, color: 'bg-yellow-500', description: 'Cheerful smile' },
    { id: 'laughing', name: 'Laughing', icon: Laugh, color: 'bg-orange-500', description: 'Joyful laughter' },
    { id: 'sad', name: 'Sad', icon: Frown, color: 'bg-blue-500', description: 'Melancholy expression' },
    { id: 'angry', name: 'Angry', icon: Angry, color: 'bg-red-500', description: 'Intense anger' },
    { id: 'surprised', name: 'Surprised', icon: AlertTriangle, color: 'bg-purple-500', description: 'Shocked reaction' },
    { id: 'loving', name: 'Loving', icon: Heart, color: 'bg-pink-500', description: 'Warm affection' },
    { id: 'confident', name: 'Confident', icon: Zap, color: 'bg-green-500', description: 'Self-assured look' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Smile className="w-4 h-4" />
          Facial Expressions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {expressions.map((expression) => {
            const IconComponent = expression.icon;
            const isSelected = currentExpression === expression.id;
            
            return (
              <Button
                key={expression.id}
                variant={isSelected ? "default" : "outline"}
                className={`h-20 flex flex-col items-center gap-2 p-3 transition-all duration-200 ${
                  isSelected 
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0' 
                    : 'hover:bg-gray-50 hover:border-gray-300'
                }`}
                onClick={() => onExpressionSelect(expression.id)}
              >
                <div className={`w-8 h-8 rounded-full ${expression.color} flex items-center justify-center transition-all duration-200 ${
                  isSelected ? 'bg-white/20' : ''
                }`}>
                  <IconComponent className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-white'}`} />
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium">{expression.name}</div>
                  <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'} leading-tight`}>
                    {expression.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <h4 className="font-medium text-blue-900 text-sm mb-1">Expression Tips</h4>
          <p className="text-blue-700 text-xs">
            Choose expressions that match your avatar's personality and intended use case.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpressionPanel;
