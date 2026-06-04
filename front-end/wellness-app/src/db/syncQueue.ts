import { Model } from '@nozbe/watermelondb';
import { database } from './index';
import { Q } from '@nozbe/watermelondb';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '@/lib/supabase';

const TABLE_MAP: Record<string, string> = {
  health_metrics: 'health_metrics',
  checkins:       'checkins',
  // ai_feedbacks intentionally omitted — backend writes, app only reads
};

// ── Enqueue a change ──────────────────────────────────────────────────────────
export async function enqueue(
  tableName: string,
  recordId: string,
  operation: 'create' | 'update' | 'delete',
  payload: object,
) {
  await database.write(async () => {
    await database.get('sync_queue').create((entry: Model) => {
      entry._raw.table_name = tableName;
      entry._raw.record_id  = recordId;
      entry._raw.operation  = operation;
      entry._raw.payload    = JSON.stringify(payload);
      entry._raw.created_at = Date.now();
      entry._raw.attempts   = 0;
    });
  });
}

// ── Flush queue to Supabase ───────────────────────────────────────────────────
export async function flushSyncQueue() {
  const net = await NetInfo.fetch();
  if (!net.isConnected) return;

  const queue = await database
    .get('sync_queue')
    .query(Q.sortBy('created_at', Q.asc))
    .fetch();

  for (const entry of queue) {
    const raw     = entry._raw;
    const payload = JSON.parse(raw.payload as string);
    const pgTable = TABLE_MAP[raw.table_name as string];

    if (!pgTable) continue;

    try {
      if (raw.operation === 'create' || raw.operation === 'update') {
        await supabase.from(pgTable).upsert({ ...payload, local_id: raw.record_id });
      } else if (raw.operation === 'delete') {
        await supabase.from(pgTable).delete().eq('local_id', raw.record_id as string);
      }

      await database.write(async () => {
        await entry.destroyPermanently();
      });

    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'unknown';

      await database.write(async () => {
        await entry.update((r: Model) => {
          r._raw.attempts   = (r._raw.attempts as number) + 1;
          r._raw.last_error = message;
        });
      });

      if ((raw.attempts as number) >= 5) {
        console.warn('[SyncQueue] giving up on entry after 5 attempts', raw.record_id);
      }
    }
  }
}

// ── Pull AI feedbacks from Supabase → local ───────────────────────────────────
export async function pullAiFeedbacks(userId: string) {
  const net = await NetInfo.fetch();
  if (!net.isConnected) return;

  const { data, error } = await supabase
    .from('ai_feedbacks')
    .select('*')
    .eq('user_id', userId)
    .order('generated_at', { ascending: false })
    .limit(20);

  if (error || !data) return;

  await database.write(async () => {
    for (const row of data) {
      const existing = await database
        .get('ai_feedbacks')
        .query(Q.where('supabase_id', row.id as string))
        .fetch();

      if (existing.length === 0) {
        await database.get('ai_feedbacks').create((f: Model) => {
          f._raw.supabase_id  = row.id;
          f._raw.generated_at = new Date(row.generated_at as string).getTime();
          f._raw.type         = row.type;
          f._raw.content      = row.content;
          f._raw.related_date = row.related_date
            ? new Date(row.related_date as string).getTime()
            : null;
          f._raw.is_read  = false;
          f._raw.synced_at = Date.now();
        });
      }
    }
  });
}