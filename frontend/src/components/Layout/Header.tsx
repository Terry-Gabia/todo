import { ThemeToggle } from './ThemeToggle';
import type { Theme } from '../../types';

interface Props {
  theme: Theme;
  onToggleTheme: () => void;
  userEmail: string | null;
  onSignOut: () => void;
  onOpenSlackSettings: () => void;
}

export function Header({ theme, onToggleTheme, userEmail, onSignOut, onOpenSlackSettings }: Props) {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">할일 관리</h1>
      </div>
      <div className="header-right">
        {userEmail && (
          <>
            <button className="btn btn-icon" onClick={onOpenSlackSettings} title="Slack 알림 설정">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z" />
                <path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                <path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z" />
                <path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z" />
                <path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z" />
                <path d="M14 20.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5h1.5v1.5z" />
                <path d="M10 9.5C10 10.33 9.33 11 8.5 11h-5C2.67 11 2 10.33 2 9.5S2.67 8 3.5 8h5c.83 0 1.5.67 1.5 1.5z" />
                <path d="M10 3.5C10 2.67 10.67 2 11.5 2S13 2.67 13 3.5 12.33 5 11.5 5H10V3.5z" />
              </svg>
            </button>
            <span className="header-email">{userEmail}</span>
            <button className="btn btn-sm btn-outline" onClick={onSignOut}>
              로그아웃
            </button>
          </>
        )}
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  );
}
