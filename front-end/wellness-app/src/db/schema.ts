import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [

    // ── User profile ─────────────────────────────────────────────────────────
    tableSchema({
      name: 'user_profiles',
      columns: [
        { name: 'supabase_id',  type: 'string', isIndexed: true },
        { name: 'display_name', type: 'string' },
        { name: 'locale',       type: 'string' },
        { name: 'synced_at',    type: 'number', isOptional: true },
      ],
    }),

    // ── Health metrics (one row per day per type) ─────────────────────────────
    tableSchema({
      name: 'health_metrics',
      columns: [
        { name: 'recorded_at',  type: 'number', isIndexed: true }, // epoch ms
        { name: 'type',         type: 'string', isIndexed: true }, // 'steps'|'sleep'|'hr'|'workout'
        { name: 'value',        type: 'number' },
        { name: 'unit',         type: 'string' },                  // 'count'|'hours'|'bpm'|'count'
        { name: 'source',       type: 'string' },                  // 'health_connect'|'manual'
        { name: 'synced_at',    type: 'number', isOptional: true },
      ],
    }),

    // ── Check-ins / mood logs ─────────────────────────────────────────────────
    tableSchema({
      name: 'checkins',
      columns: [
        { name: 'checked_in_at', type: 'number', isIndexed: true },
        { name: 'mood',          type: 'number' },                 // 1-5
        { name: 'energy',        type: 'number' },                 // 1-5
        { name: 'note',          type: 'string', isOptional: true },
        { name: 'synced_at',     type: 'number', isOptional: true },
      ],
    }),

    // ── AI feedbacks (written by backend, read by app) ────────────────────────
    tableSchema({
      name: 'ai_feedbacks',
      columns: [
        { name: 'supabase_id',   type: 'string', isIndexed: true },
        { name: 'generated_at',  type: 'number', isIndexed: true },
        { name: 'type',          type: 'string' },                 // 'daily'|'weekly'|'insight'
        { name: 'content',       type: 'string' },                 // full text
        { name: 'related_date',  type: 'number', isOptional: true },
        { name: 'is_read',       type: 'boolean' },
        { name: 'synced_at',     type: 'number', isOptional: true },
      ],
    }),

    // ── Sync queue (outbox) ───────────────────────────────────────────────────
    tableSchema({
      name: 'sync_queue',
      columns: [
        { name: 'table_name',  type: 'string' },                   // which table
        { name: 'record_id',   type: 'string' },                   // WatermelonDB local id
        { name: 'operation',   type: 'string' },                   // 'create'|'update'|'delete'
        { name: 'payload',     type: 'string' },                   // JSON stringified
        { name: 'created_at',  type: 'number' },
        { name: 'attempts',    type: 'number' },                   // retry counter
        { name: 'last_error',  type: 'string', isOptional: true },
      ],
    }),

  ],
});