import { Module } from '@nestjs/common';
import { SlackService } from './slack.service';
import { NotificationService } from './notification.service';

@Module({
  providers: [SlackService, NotificationService],
  exports: [SlackService],
})
export class SlackModule {}
