import { useEffect, useState } from 'react';
import { readStorage, writeStorage } from '../services/storage';

const DEFAULT_PREFERENCES = {
  darkMode: readStorage('lf_dark_mode', false),
  fontSize: readStorage('lf_font_size', '14'),
};

export function useAppPreferences() {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);

  useEffect(() => {
    writeStorage('lf_dark_mode', preferences.darkMode);
  }, [preferences.darkMode]);

  useEffect(() => {
    writeStorage('lf_font_size', preferences.fontSize);
  }, [preferences.fontSize]);

  useEffect(() => {
    document.body.dataset.theme = preferences.darkMode ? 'dark' : 'light';
    document.body.style.fontSize = `${preferences.fontSize}px`;
  }, [preferences.darkMode, preferences.fontSize]);

  return {
    preferences,
    setPreference(key, value) {
      setPreferences((previous) => ({ ...previous, [key]: value }));
    },
  };
}
