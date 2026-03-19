import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { supabaseAdmin } from '../config/supabase';
import { SlackService } from './slack.service';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly slackService: SlackService) {}

  onModuleInit() {
    this.subscribeToChanges();
  }

  private subscribeToChanges() {
    supabaseAdmin
      .channel('todos-notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        async (payload) => {
          try {
            if (payload.eventType === 'INSERT') {
              const todo = payload.new as any;
              const message = `📝 새 할일 추가됨\n${todo.text}\n[${todo.category}] ${this.getPriorityEmoji(todo.priority)} ${todo.priority}`;
              await this.notifyUser(todo.user_id, message);
            } else if (payload.eventType === 'UPDATE') {
              const todo = payload.new as any;
              const old = payload.old as any;
              if (todo.completed && !old.completed) {
                const message = `✅ 할일 완료!\n${todo.text}`;
                await this.notifyUser(todo.user_id, message);
              }
            } else if (payload.eventType === 'DELETE') {
              const old = payload.old as any;
              if (old.user_id) {
                const message = `🗑️ 할일 삭제됨\n${old.text || '(삭제된 항목)'}`;
                await this.notifyUser(old.user_id, message);
              }
            }
          } catch (error) {
            this.logger.error('알림 처리 오류:', error);
          }
        }
      )
      .subscribe();

    this.logger.log('Supabase Realtime 알림 구독 시작');
  }

  private async notifyUser(userId: string, message: string) {
    const { data } = await supabaseAdmin
      .from('user_profiles')
      .select('slack_user_id')
      .eq('user_id', userId)
      .single();

    if (data?.slack_user_id) {
      await this.slackService.sendNotification(data.slack_user_id, message);
    }
  }

  private getPriorityEmoji(priority: string): string {
    if (priority === '높음') return '🔴';
    if (priority === '보통') return '🟡';
    return '🟢';
  }
}
