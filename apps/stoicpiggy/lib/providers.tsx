import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';
import { type AppStrings, type Lang, STR } from './content';
import { type ThemeColors, THEMES, type ThemeName } from './theme';

interface ThemeCtxValue {
  name: ThemeName;
  colors: ThemeColors;
  setTheme: (name: ThemeName) => void;
}
interface LangCtxValue {
  lang: Lang;
  t: AppStrings;
  setLang: (lang: Lang) => void;
}

const ThemeCtx = createContext<ThemeCtxValue>({ name: 'zen', colors: THEMES.zen, setTheme: () => {} });
const LangCtx = createContext<LangCtxValue>({ lang: 'es', t: STR.es, setLang: () => {} });

export function AppProviders({ children }: { children: ReactNode }) {
  const [name, setName] = useState<ThemeName>('zen');
  const [lang, setLang] = useState<Lang>('es');

  const themeValue = useMemo<ThemeCtxValue>(
    () => ({ name, colors: THEMES[name], setTheme: setName }),
    [name],
  );
  const langValue = useMemo<LangCtxValue>(() => ({ lang, t: STR[lang], setLang }), [lang]);

  return (
    <ThemeCtx.Provider value={themeValue}>
      <LangCtx.Provider value={langValue}>{children}</LangCtx.Provider>
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);
export const useLang = () => useContext(LangCtx);
