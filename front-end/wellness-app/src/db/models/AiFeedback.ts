import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export class AiFeedback extends Model {
  static table = 'ai_feedbacks';

  @field('supabase_id')   supabaseId!: string;
  @date('generated_at')   generatedAt!: Date;
  @field('type')          type!: 'daily' | 'weekly' | 'insight';
  @field('content')       content!: string;
  @date('related_date')   relatedDate!: Date | null;
  @field('is_read')       isRead!: boolean;
  @date('synced_at')      syncedAt!: Date | null;
}