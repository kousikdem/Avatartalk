import * as React from "react";
import { Check, ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface IconSelectOption {
  value: string;
  label: string;
  icon: LucideIcon;
  color?: string;
}

interface IconSelectProps {
  options: IconSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function IconSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className,
}: IconSelectProps) {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder}>
          {selectedOption && (
            <div className="flex items-center gap-2">
              <selectedOption.icon
                className={cn("h-4 w-4", selectedOption.color || "text-muted-foreground")}
              />
              <span>{selectedOption.label}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-background border border-border shadow-lg z-50 max-h-[300px]">
        {options.map((option) => {
          const IconComponent = option.icon;
          return (
            <SelectItem
              key={option.value}
              value={option.value}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <IconComponent
                  className={cn("h-4 w-4", option.color || "text-muted-foreground")}
                />
                <span>{option.label}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
