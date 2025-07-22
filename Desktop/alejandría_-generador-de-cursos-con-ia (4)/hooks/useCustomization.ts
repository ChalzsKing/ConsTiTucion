import React, { createContext, useContext } from 'react';
import { useLocalStorage } from './useLocalStorage';

export const FONT_SIZES = ['sm', 'base', 'lg', 'xl'] as const;
export const ACCENT_COLORS = ['sky', 'rose', 'emerald', 'amber', 'violet', 'black'] as const;
export const FONT_FAMILIES = ['sans', 'serif'] as const;
export const HIGHLIGHT_COLORS = ['yellow', 'pink', 'green', 'blue', 'gray'] as const;

export type FontSize = typeof FONT_SIZES[number];
export type AccentColor = typeof ACCENT_COLORS[number];
export type FontFamily = typeof FONT_FAMILIES[number];
export type HighlightColor = typeof HIGHLIGHT_COLORS[number];

interface CustomizationSettings {
  fontSize: FontSize;
  accentColor: AccentColor;
  fontFamily: FontFamily;
  highlightColor: HighlightColor;
}

interface CustomizationContextType extends CustomizationSettings {
  setFontSize: (size: FontSize) => void;
  setAccentColor: (color: AccentColor) => void;
  setFontFamily: (family: FontFamily) => void;
  setHighlightColor: (color: HighlightColor) => void;
}

const CustomizationContext = createContext<CustomizationContextType | undefined>(undefined);

const defaultSettings: CustomizationSettings = {
  fontSize: 'base',
  accentColor: 'sky',
  fontFamily: 'sans',
  highlightColor: 'yellow',
};

export const CustomizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useLocalStorage<CustomizationSettings>('alejandria-customization', defaultSettings);

  const setFontSize = (fontSize: FontSize) => setSettings(s => ({...s, fontSize}));
  const setAccentColor = (accentColor: AccentColor) => setSettings(s => ({...s, accentColor}));
  const setFontFamily = (fontFamily: FontFamily) => setSettings(s => ({...s, fontFamily}));
  const setHighlightColor = (highlightColor: HighlightColor) => setSettings(s => ({...s, highlightColor}));

  const value: CustomizationContextType = {
      ...(settings || defaultSettings),
      setFontSize,
      setAccentColor,
      setFontFamily,
      setHighlightColor,
  };
  
  return React.createElement(CustomizationContext.Provider, { value }, children);
};

export const useCustomization = (): CustomizationContextType => {
  const context = useContext(CustomizationContext);
  if (context === undefined) {
    throw new Error('useCustomization must be used within a CustomizationProvider');
  }
  return context;
};