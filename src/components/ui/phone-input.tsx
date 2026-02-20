import * as React from "react";
import { useState, useMemo } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { countries, type Country } from "@/data/countries";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function PhoneInput({
  value,
  onChange,
  placeholder = "Enter phone number",
  className,
}: PhoneInputProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Parse the current value to extract country code and number
  const parsePhoneValue = (val: string): { countryCode: string; phoneNumber: string } => {
    if (!val) return { countryCode: "+91", phoneNumber: "" };
    
    // Try to find matching country dial code
    for (const country of countries) {
      if (val.startsWith(country.dialCode)) {
        return {
          countryCode: country.dialCode,
          phoneNumber: val.slice(country.dialCode.length).trim(),
        };
      }
    }
    
    // Default to India if no match
    return { countryCode: "+91", phoneNumber: val.replace(/^\+\d+\s*/, "") };
  };

  const { countryCode, phoneNumber } = parsePhoneValue(value);
  
  const selectedCountry = useMemo(() => {
    return countries.find((c) => c.dialCode === countryCode) || countries.find((c) => c.code === "IN");
  }, [countryCode]);

  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countries;
    const query = searchQuery.toLowerCase();
    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.dialCode.includes(query) ||
        country.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleCountrySelect = (country: Country) => {
    const newValue = phoneNumber ? `${country.dialCode} ${phoneNumber}` : country.dialCode;
    onChange(newValue);
    setOpen(false);
    setSearchQuery("");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/[^\d\s-]/g, "");
    const newValue = newNumber ? `${countryCode} ${newNumber}` : countryCode;
    onChange(newValue);
  };

  return (
    <div className={cn("flex gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[120px] justify-between px-3 shrink-0"
          >
            <span className="flex items-center gap-1.5 text-sm">
              <span className="text-base">{selectedCountry?.flag}</span>
              <span className="font-medium">{countryCode}</span>
            </span>
            <ChevronDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0 bg-background border border-border shadow-lg z-50" align="start">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          </div>
          <ScrollArea className="h-[250px]">
            <div className="p-1">
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleCountrySelect(country)}
                  className={cn(
                    "flex items-center gap-2 w-full px-2 py-2 text-sm rounded-md hover:bg-muted transition-colors",
                    country.dialCode === countryCode && "bg-primary/10 text-primary"
                  )}
                >
                  <span className="text-lg">{country.flag}</span>
                  <span className="flex-1 text-left truncate">{country.name}</span>
                  <span className="text-muted-foreground text-xs font-medium">
                    {country.dialCode}
                  </span>
                  {country.dialCode === countryCode && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
              {filteredCountries.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No country found
                </p>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
      <Input
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneChange}
        placeholder={placeholder}
        className="flex-1"
      />
    </div>
  );
}
