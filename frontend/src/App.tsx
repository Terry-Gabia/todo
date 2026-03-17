import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { useTodos } from './hooks/useTodos';
import { Auth } from './components/Auth/Auth';
import { Header } from './components/Layout/Header';
import { TodoList } from './components/Todo/TodoList';
import { TelegramSettings } from './components/Telegram/TelegramSettings';

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme(user?.id ?? null);
  const { todos, loading: todosLoading, addTodo, toggleTodo, updateTodo, deleteTodo } = useTodos(user?.id ?? null);
  const [showTelegramSettings, setShowTelegramSettings] = useState(false);

  if (authLoading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="theme-toggle-fixed">
          <button className="theme-toggle" onClick={toggleTheme} title="테마 변경">
            {theme === 'light' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>
        </div>
        <Auth />
      </>
    );
  }

  return (
    <div className="app">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        userEmail={user.email ?? null}
        onSignOut={signOut}
        onOpenTelegramSettings={() => setShowTelegramSettings(true)}
      />
      <main className="main">
        <TodoList
          todos={todos}
          loading={todosLoading}
          onAdd={addTodo}
          onToggle={toggleTodo}
          onUpdate={updateTodo}
          onDelete={deleteTodo}
        />
      </main>
      {showTelegramSettings && (
        <TelegramSettings
          userId={user.id}
          onClose={() => setShowTelegramSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
