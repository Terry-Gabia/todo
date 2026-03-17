import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { supabaseAdmin } from '../config/supabase';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: TelegramBot;
  private readonly logger = new Logger(TelegramService.name);

  onModuleInit() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      this.logger.warn('TELEGRAM_BOT_TOKEN이 설정되지 않았습니다. 텔레그램 봇이 비활성화됩니다.');
      return;
    }

    this.bot = new TelegramBot(token, { polling: true });
    this.setupCommands();
    this.logger.log('텔레그램 봇이 시작되었습니다.');
  }

  private setupCommands() {
    // /내아이디 또는 /myid - Chat ID 확인
    this.bot.onText(/\/(내아이디|myid)/, (msg) => {
      this.bot.sendMessage(msg.chat.id, `당신의 Chat ID: ${msg.chat.id}`);
    });

    // /목록 또는 /list - 미완료 할일 목록
    this.bot.onText(/\/(목록|list)/, async (msg) => {
      const chatId = msg.chat.id.toString();
      try {
        const userId = await this.getUserIdByChatId(chatId);
        if (!userId) {
          this.bot.sendMessage(msg.chat.id, '앱에서 텔레그램 Chat ID를 먼저 설정해주세요.');
          return;
        }

        const { data: todos } = await supabaseAdmin
          .from('todos')
          .select('*')
          .eq('user_id', userId)
          .eq('completed', false)
          .order('created_at', { ascending: false });

        if (!todos || todos.length === 0) {
          this.bot.sendMessage(msg.chat.id, '미완료 할일이 없습니다! 🎉');
          return;
        }

        const list = todos
          .map((t, i) => {
            const priority = t.priority === '높음' ? '🔴' : t.priority === '보통' ? '🟡' : '🟢';
            return `${i + 1}. ${priority} ${t.text} [${t.category}]`;
          })
          .join('\n');

        this.bot.sendMessage(msg.chat.id, `📋 미완료 할일 (${todos.length}개)\n\n${list}`);
      } catch (error) {
        this.logger.error('목록 조회 오류:', error);
        this.bot.sendMessage(msg.chat.id, '오류가 발생했습니다. 다시 시도해주세요.');
      }
    });

    // /완료 [번호] 또는 /done [번호] - 할일 완료 처리
    this.bot.onText(/\/(완료|done)\s+(\d+)/, async (msg, match) => {
      const chatId = msg.chat.id.toString();
      const index = parseInt(match![2]) - 1;

      try {
        const userId = await this.getUserIdByChatId(chatId);
        if (!userId) {
          this.bot.sendMessage(msg.chat.id, '앱에서 텔레그램 Chat ID를 먼저 설정해주세요.');
          return;
        }

        const { data: todos } = await supabaseAdmin
          .from('todos')
          .select('*')
          .eq('user_id', userId)
          .eq('completed', false)
          .order('created_at', { ascending: false });

        if (!todos || index < 0 || index >= todos.length) {
          this.bot.sendMessage(msg.chat.id, '유효하지 않은 번호입니다. /목록 으로 확인해주세요.');
          return;
        }

        const todo = todos[index];
        await supabaseAdmin
          .from('todos')
          .update({ completed: true })
          .eq('id', todo.id);

        this.bot.sendMessage(msg.chat.id, `✅ 완료: ${todo.text}`);
      } catch (error) {
        this.logger.error('완료 처리 오류:', error);
        this.bot.sendMessage(msg.chat.id, '오류가 발생했습니다. 다시 시도해주세요.');
      }
    });

    // 일반 텍스트 입력 → 할일 추가
    this.bot.on('message', async (msg) => {
      if (!msg.text || msg.text.startsWith('/')) return;

      const chatId = msg.chat.id.toString();
      try {
        const userId = await this.getUserIdByChatId(chatId);
        if (!userId) {
          this.bot.sendMessage(msg.chat.id, '앱에서 텔레그램 Chat ID를 먼저 설정해주세요.\n/내아이디 로 Chat ID를 확인할 수 있습니다.');
          return;
        }

        const newTodo = {
          id: crypto.randomUUID(),
          user_id: userId,
          text: msg.text,
          completed: false,
          category: '기타',
          priority: '보통',
          due_date: null,
          created_at: Date.now(),
        };

        await supabaseAdmin.from('todos').insert(newTodo);
        this.bot.sendMessage(msg.chat.id, `📝 할일 추가됨: ${msg.text}`);
      } catch (error) {
        this.logger.error('할일 추가 오류:', error);
        this.bot.sendMessage(msg.chat.id, '할일 추가에 실패했습니다. 다시 시도해주세요.');
      }
    });
  }

  // Chat ID로 user_id 찾기
  private async getUserIdByChatId(chatId: string): Promise<string | null> {
    const { data } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id')
      .eq('telegram_chat_id', chatId)
      .single();

    return data?.user_id ?? null;
  }

  // 알림 발송
  async sendNotification(chatId: string, message: string) {
    if (!this.bot) return;
    try {
      await this.bot.sendMessage(chatId, message);
    } catch (error) {
      this.logger.error(`알림 발송 실패 (chatId: ${chatId}):`, error);
    }
  }
}
