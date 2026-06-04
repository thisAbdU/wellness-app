import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export class HealthMetric extends Model {
  static table = 'health_metrics';

  @date('recorded_at')  recordedAt!: Date;
  @field('type')        type!: 'steps' | 'sleep' | 'hr' | 'workout';
  @field('value')       value!: number;
  @field('unit')        unit!: string;
  @field('source')      source!: string;
  @date('synced_at')    syncedAt!: Date | null;
}