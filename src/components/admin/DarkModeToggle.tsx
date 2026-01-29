'use client';

import { useTheme } from './ThemeContext';

export default function DarkModeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            className={`dark-mode-toggle ${isDark ? 'active' : ''}`}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            <span className="toggle-thumb">
                {isDark ? '🌙' : '☀️'}
            </span>
        </button>
    );
}
