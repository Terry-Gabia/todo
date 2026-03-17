import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Props {
  userId: string;
  onClose: () => void;
}

export function TelegramSettings({ userId, onClose }: Props) {
  const [chatId, setChatId] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase
      .from('user_profiles')
      .select('telegram_chat_id')
      .eq('user_id', userId)
      .single()
      .then(({ data }) => {
        if (data?.telegram_chat_id) {
          setChatId(data.telegram_chat_id);
        }
      });
  }, [userId]);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('user_profiles')
      .upsert(
        { user_id: userId, telegram_chat_id: chatId || null },
        { onConflict: 'user_id' }
      );
    setLoading(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>텔레그램 알림 설정</h2>
          <button className="btn btn-icon" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="telegram-guide">
            <h3>설정 방법</h3>
            <ol>
              <li>텔레그램에서 할일 봇을 찾아 대화를 시작합니다.</li>
              <li><code>/내아이디</code> 또는 <code>/myid</code>를 입력하여 Chat ID를 확인합니다.</li>
              <li>아래 입력란에 Chat ID를 입력하고 저장합니다.</li>
            </ol>
          </div>

          <div className="form-group">
            <label htmlFor="chatId">텔레그램 Chat ID</label>
            <input
              id="chatId"
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="예: 123456789"
            />
          </div>

          <div className="modal-actions">
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
              {loading ? '저장 중...' : saved ? '저장 완료!' : '저장'}
            </button>
            <button className="btn btn-outline" onClick={onClose}>닫기</button>
          </div>
        </div>
      </div>
    </div>
  );
}
