import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { App } from '@slack/bolt';
import { supabaseAdmin } from '../config/supabase';

@Injectable()
export class SlackService implements OnModuleInit {
  private app: App;
  private readonly logger = new Logger(SlackService.name);

  onModuleInit() {
    const token = process.env.SLACK_BOT_TOKEN;
    const appToken = process.env.SLACK_APP_TOKEN;
    if (!token || !appToken) {
      this.logger.warn('SLACK_BOT_TOKEN 또는 SLACK_APP_TOKEN이 설정되지 않았습니다. Slack 봇이 비활성화됩니다.');
      return;
    }

    this.app = new App({
      token,
      appToken,
      socketMode: true,
    });

    this.setupCommands();
    this.app.start().then(() => {
      this.logger.log('Slack 봇이 시작되었습니다.');
    });
  }

  private setupCommands() {
    // 모든 DM 메시지 처리
    this.app.message(async ({ message, say }) => {
      if (message.subtype) return; // 편집/삭제 등 무시
      const msg = message as { text?: string; user?: string };
      if (!msg.text || !msg.user) return;

      const text = msg.text.trim();
      const slackUserId = msg.user;

      try {
        // 목록 / list
        if (/^(목록|list)$/i.test(text)) {
          await this.handleList(slackUserId, say);
          return;
        }

        // 완료 [번호] / done [번호]
        const doneMatch = text.match(/^(완료|done)\s+(\d+)$/i);
        if (doneMatch) {
          const index = parseInt(doneMatch[2]) - 1;
          await this.handleDone(slackUserId, index, say);
          return;
        }

        // 내아이디 / myid
        if (/^(내아이디|myid)$/i.test(text)) {
          await say(`당신의 Slack User ID: ${slackUserId}`);
          return;
        }

        // 일반 텍스트 → 할일 추가
        await this.handleAddTodo(slackUserId, text, say);
      } catch (error) {
        this.logger.error('메시지 처리 오류:', error);
        await say('오류가 발생했습니다. 다시 시도해주세요.');
      }
    });
  }

  private async handleList(slackUserId: string, say: (text: string) => Promise<any>) {
    const userId = await this.getUserIdBySlackId(slackUserId);
    if (!userId) {
      await say('앱에서 Slack Member ID를 먼저 설정해주세요.');
      return;
    }

    const { data: todos } = await supabaseAdmin
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false)
      .order('created_at', { ascending: false });

    if (!todos || todos.length === 0) {
      await say('미완료 할일이 없습니다! :tada:');
      return;
    }

    const list = todos
      .map((t, i) => {
        const priority = t.priority === '높음' ? ':red_circle:' : t.priority === '보통' ? ':large_yellow_circle:' : ':green_circle:';
        return `${i + 1}. ${priority} ${t.text} [${t.category}]`;
      })
      .join('\n');

    await say(`:clipboard: 미완료 할일 (${todos.length}개)\n\n${list}`);
  }

  private async handleDone(slackUserId: string, index: number, say: (text: string) => Promise<any>) {
    const userId = await this.getUserIdBySlackId(slackUserId);
    if (!userId) {
      await say('앱에서 Slack Member ID를 먼저 설정해주세요.');
      return;
    }

    const { data: todos } = await supabaseAdmin
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false)
      .order('created_at', { ascending: false });

    if (!todos || index < 0 || index >= todos.length) {
      await say('유효하지 않은 번호입니다. `목록` 으로 확인해주세요.');
      return;
    }

    const todo = todos[index];
    await supabaseAdmin
      .from('todos')
      .update({ completed: true })
      .eq('id', todo.id);

    await say(`:white_check_mark: 완료: ${todo.text}`);
  }

  private async handleAddTodo(slackUserId: string, text: string, say: (text: string) => Promise<any>) {
    const userId = await this.getUserIdBySlackId(slackUserId);
    if (!userId) {
      await say('앱에서 Slack Member ID를 먼저 설정해주세요.\n`내아이디` 로 Member ID를 확인할 수 있습니다.');
      return;
    }

    const newTodo = {
      id: crypto.randomUUID(),
      user_id: userId,
      text,
      completed: false,
      category: '기타',
      priority: '보통',
      due_date: null,
      created_at: Date.now(),
    };

    await supabaseAdmin.from('todos').insert(newTodo);
    await say(`:memo: 할일 추가됨: ${text}`);
  }

  // Slack User ID로 user_id 찾기
  async getUserIdBySlackId(slackUserId: string): Promise<string | null> {
    const { data } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id')
      .eq('slack_user_id', slackUserId)
      .single();

    return data?.user_id ?? null;
  }

  // 알림 발송 (DM)
  async sendNotification(slackUserId: string, message: string) {
    if (!this.app) return;
    try {
      const result = await this.app.client.conversations.open({
        users: slackUserId,
      });
      if (result.channel?.id) {
        await this.app.client.chat.postMessage({
          channel: result.channel.id,
          text: message,
        });
      }
    } catch (error) {
      this.logger.error(`알림 발송 실패 (slackUserId: ${slackUserId}):`, error);
    }
  }
}
