import React, { useState, useRef } from 'react';
import { Check, GripVertical, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DraggableOption {
  value: string;
  label: string;
  icon: LucideIcon;
  color?: string;
}

interface DraggableSelectProps {
  options: DraggableOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  selectedColor?: string;
  selectedBg?: string;
}

export function DraggableSelect({
  options,
  value,
  onChange,
  className,
  selectedColor = 'border-primary bg-primary/10 text-primary',
  selectedBg = 'bg-primary/5'
}: DraggableSelectProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent, optionValue: string) => {
    setDraggedItem(optionValue);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', optionValue);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragOver = (e: React.DragEvent, optionValue: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(optionValue);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e: React.DragEvent, targetValue: string) => {
    e.preventDefault();
    const droppedValue = e.dataTransfer.getData('text/plain');
    
    if (droppedValue) {
      onChange(targetValue);
    }
    
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleClick = (optionValue: string) => {
    onChange(optionValue);
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3",
        className
      )}
    >
      {options.map((option) => {
        const IconComponent = option.icon;
        const isSelected = value === option.value;
        const isDragging = draggedItem === option.value;
        const isDragOver = dragOverItem === option.value;

        return (
          <div
            key={option.value}
            draggable
            onDragStart={(e) => handleDragStart(e, option.value)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, option.value)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, option.value)}
            onClick={() => handleClick(option.value)}
            className={cn(
              "flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left text-sm cursor-grab active:cursor-grabbing select-none group",
              isSelected 
                ? selectedColor
                : "border-border hover:border-muted-foreground/30 hover:bg-muted/50",
              isDragging && "opacity-50 scale-95 shadow-lg",
              isDragOver && "border-primary border-dashed bg-primary/5 scale-105",
              "hover:shadow-md"
            )}
          >
            <GripVertical className={cn(
              "h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-50 transition-opacity",
              isDragging && "opacity-100"
            )} />
            <IconComponent 
              className={cn(
                "h-4 w-4 flex-shrink-0",
                isSelected ? "text-primary" : (option.color || "text-muted-foreground")
              )} 
            />
            <span className="truncate flex-1">{option.label}</span>
            {isSelected && <Check className="h-4 w-4 ml-auto text-primary" />}
          </div>
        );
      })}
    </div>
  );
}
