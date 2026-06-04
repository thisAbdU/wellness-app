import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export class Checkin extends Model {
  static table = 'checkins';

  @date('checked_in_at') checkedInAt!: Date;
  @field('mood')         mood!: number;
  @field('energy')       energy!: number;
  @field('note')         note!: string | null;
  @date('synced_at')     syncedAt!: Date | null;
}