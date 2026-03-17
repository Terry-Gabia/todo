import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { supabaseAdmin } from '../config/supabase';
import { TelegramService } from './telegram.service';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly telegramService: TelegramService) {}

  onModuleInit() {
    this.subscribeToChanges();
  }

  private subscribeToChanges() {
    const channel = supabaseAdmin
      .channel('todos-notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        async (payload) => {
          try {
            if (payload.eventType === 'INSERT') {
              const todo = payload.new as any;
              const chatId = await this.getChatId(todo.user_id);
              if (chatId) {
                await this.telegramService.sendNotification(
                  chatId,
                  `📝 새 할일 추가됨\n${todo.text}\n[${todo.category}] ${this.getPriorityEmoji(todo.priority)} ${todo.priority}`
                );
              }
            } else if (payload.eventType === 'UPDATE') {
              const todo = payload.new as any;
              const old = payload.old as any;
              if (todo.completed && !old.completed) {
                const chatId = await this.getChatId(todo.user_id);
                if (chatId) {
                  await this.telegramService.sendNotification(
                    chatId,
                    `✅ 할일 완료!\n${todo.text}`
                  );
                }
              }
            } else if (payload.eventType === 'DELETE') {
              const old = payload.old as any;
              if (old.user_id) {
                const chatId = await this.getChatId(old.user_id);
                if (chatId) {
                  await this.telegramService.sendNotification(
                    chatId,
                    `🗑️ 할일 삭제됨\n${old.text || '(삭제된 항목)'}`
                  );
                }
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

  private async getChatId(userId: string): Promise<string | null> {
    const { data } = await supabaseAdmin
      .from('user_profiles')
      .select('telegram_chat_id')
      .eq('user_id', userId)
      .single();

    return data?.telegram_chat_id ?? null;
  }

  private getPriorityEmoji(priority: string): string {
    if (priority === '높음') return '🔴';
    if (priority === '보통') return '🟡';
    return '🟢';
  }
}
