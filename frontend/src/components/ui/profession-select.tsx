import * as React from "react";
import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Plus, Search, type LucideIcon, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export interface ProfessionOption {
  value: string;
  label: string;
  icon: LucideIcon;
  color?: string;
}

interface ProfessionSelectProps {
  options: ProfessionOption[];
  value: string;
  onChange: (value: string, isCustom: boolean) => void;
  placeholder?: string;
  className?: string;
  customValue?: string;
  onCustomValueChange?: (value: string) => void;
}

export function ProfessionSelect({
  options,
  value,
  onChange,
  placeholder = "Select profession",
  className,
  customValue = "",
  onCustomValueChange,
}: ProfessionSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddNew, setShowAddNew] = useState(false);
  const [newProfession, setNewProfession] = useState("");

  const selectedOption = options.find((opt) => opt.value === value);
  const isCustomSelection = value === "custom" || (value && !selectedOption);

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  const handleSelect = (optionValue: string) => {
    const option = options.find((opt) => opt.value === optionValue);
    if (option) {
      onChange(optionValue, false);
      setOpen(false);
      setSearchQuery("");
      setShowAddNew(false);
    }
  };

  const handleAddNewProfession = () => {
    if (newProfession.trim()) {
      onChange("custom", true);
      onCustomValueChange?.(newProfession.trim());
      setOpen(false);
      setSearchQuery("");
      setNewProfession("");
      setShowAddNew(false);
    }
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    // Show add new option when there are no matches
    const hasMatches = options.some((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
    setShowAddNew(search.length > 0 && !hasMatches);
  };

  const displayValue = isCustomSelection && customValue 
    ? customValue 
    : selectedOption?.label || placeholder;

  const DisplayIcon = selectedOption?.icon || Briefcase;
  const displayColor = selectedOption?.color || "text-muted-foreground";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <DisplayIcon className={cn("h-4 w-4 shrink-0", displayColor)} />
            <span className="truncate">{displayValue}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[350px] p-0 bg-background border border-border shadow-lg z-50" 
        align="start"
      >
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder="Search profession..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList className="max-h-[300px] overflow-y-auto">
            {filteredOptions.length === 0 && !showAddNew && (
              <CommandEmpty>No profession found.</CommandEmpty>
            )}
            
            <CommandGroup>
              {filteredOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="cursor-pointer"
                  >
                    <IconComponent
                      className={cn("mr-2 h-4 w-4", option.color || "text-muted-foreground")}
                    />
                    <span className="flex-1">{option.label}</span>
                    {value === option.value && (
                      <Check className="ml-2 h-4 w-4 text-primary" />
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>

            {/* Show add new option when search has no matches */}
            {showAddNew && searchQuery && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Add new profession">
                  <div className="p-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Enter profession name"
                        value={newProfession || searchQuery}
                        onChange={(e) => setNewProfession(e.target.value)}
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddNewProfession();
                          }
                        }}
                      />
                      <Button 
                        size="sm" 
                        onClick={handleAddNewProfession}
                        disabled={!(newProfession || searchQuery).trim()}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Can't find your profession? Add it as a custom option.
                    </p>
                  </div>
                </CommandGroup>
              </>
            )}

            {/* Always show "Add custom" option at the bottom */}
            {!showAddNew && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    value="add-custom"
                    onSelect={() => {
                      setShowAddNew(true);
                      setNewProfession("");
                    }}
                    className="cursor-pointer text-muted-foreground"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Add custom profession...</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}

            {/* Add new profession form when explicitly triggered */}
            {showAddNew && !searchQuery && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Add new profession">
                  <div className="p-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Enter profession name"
                        value={newProfession}
                        onChange={(e) => setNewProfession(e.target.value)}
                        className="flex-1"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddNewProfession();
                          }
                          if (e.key === "Escape") {
                            setShowAddNew(false);
                          }
                        }}
                      />
                      <Button 
                        size="sm" 
                        onClick={handleAddNewProfession}
                        disabled={!newProfession.trim()}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter your profession and click Add.
                    </p>
                  </div>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
