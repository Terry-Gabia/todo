import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Props {
  userId: string;
  onClose: () => void;
}

export function SlackSettings({ userId, onClose }: Props) {
  const [slackUserId, setSlackUserId] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase
      .from('user_profiles')
      .select('slack_user_id')
      .eq('user_id', userId)
      .single()
      .then(({ data }) => {
        if (data?.slack_user_id) {
          setSlackUserId(data.slack_user_id);
        }
      });
  }, [userId]);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('user_profiles')
      .upsert(
        { user_id: userId, slack_user_id: slackUserId || null },
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
          <h2>Slack 알림 설정</h2>
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
              <li>Slack 워크스페이스에서 할일 봇이 추가되어 있는지 확인합니다.</li>
              <li>Slack 프로필을 클릭 → 점 3개 메뉴(&#8943;) → <strong>"멤버 ID 복사"</strong>를 선택합니다.</li>
              <li>아래 입력란에 Member ID를 입력하고 저장합니다.</li>
            </ol>
          </div>

          <div className="form-group">
            <label htmlFor="slackUserId">Slack Member ID</label>
            <input
              id="slackUserId"
              type="text"
              value={slackUserId}
              onChange={(e) => setSlackUserId(e.target.value)}
              placeholder="예: U01ABCD2EFG"
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
