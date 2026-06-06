import { Database } from '@nozbe/watermelondb';
import { Platform } from 'react-native';
import { schema } from './schema';
import { HealthMetric } from './models/HealthMetrics';
import { Checkin } from './models/Checkin';
import { AiFeedback } from './models/AiFeedback';
import { SyncQueue } from './models/SyncQueue';

const modelClasses = [HealthMetric, Checkin, AiFeedback, SyncQueue];

function makeAdapter() {
  if (Platform.OS === 'web') {
    // Web: in-memory only (no persistence) — good enough for dev/testing
    const LokiJSAdapter = require('@nozbe/watermelondb/adapters/lokijs').default;
    return new LokiJSAdapter({
      schema,
      useWebWorker: false,
      useIncrementalIndexedDB: false,
    });
  }

  // iOS / Android: real SQLite
  const SQLiteAdapter = require('@nozbe/watermelondb/adapters/sqlite').default;
  return new SQLiteAdapter({
    schema,
    dbName: 'wellness_db',
    jsi: true,
    onSetUpError: (e: Error) => console.error('[WatermelonDB] setup failed', e),
  });
}

export const database = new Database({
  adapter: makeAdapter(),
  modelClasses,
});