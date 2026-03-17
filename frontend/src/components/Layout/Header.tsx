import { ThemeToggle } from './ThemeToggle';
import type { Theme } from '../../types';

interface Props {
  theme: Theme;
  onToggleTheme: () => void;
  userEmail: string | null;
  onSignOut: () => void;
  onOpenTelegramSettings: () => void;
}

export function Header({ theme, onToggleTheme, userEmail, onSignOut, onOpenTelegramSettings }: Props) {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">할일 관리</h1>
      </div>
      <div className="header-right">
        {userEmail && (
          <>
            <button className="btn btn-icon" onClick={onOpenTelegramSettings} title="텔레그램 알림 설정">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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
