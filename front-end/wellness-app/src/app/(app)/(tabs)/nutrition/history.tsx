import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AppCard } from '@/components/ui/AppCard';
import { ScreenHeader } from '@/components/navigation/ScreenHeader';
import { Colors, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

type HistoryRow = {
  date: string;
  followed: boolean;
  steps: number;
};

function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function NutritionHistory() {
  const { user, profile } = useAuth();
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const since = new Date();
        since.setDate(since.getDate() - 14);
        const { data, error } = await supabase
          .from('health_daily_summaries')
          .select('summary_date, steps, active_minutes, calories_burned')
          .eq('user_id', user!.id)
          .gte('summary_date', since.toISOString().slice(0, 10))
          .order('summary_date', { ascending: false });

        if (error) throw error;

        const rows: HistoryRow[] = (data ?? []).map((row) => {
          const steps = Number(row.steps ?? 0);
          const active = Number(row.active_minutes ?? 0);
          const followed = steps >= 5000 || active >= 20;
          return {
            date: formatDate(String(row.summary_date)),
            followed,
            steps,
          };
        });

        if (rows.length === 0 && profile) {
          setHistory([
            {
              date: formatDate(new Date().toISOString().slice(0, 10)),
              followed: true,
              steps: 0,
            },
          ]);
        } else {
          setHistory(rows);
        }
      } catch {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user?.id, profile]);

  if (loading) {
    return (
      <AppScreen>
        <ScreenHeader title="History" showBack />
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.light.primary} />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScreenHeader title="History" showBack />
      {history.length === 0 ? (
        <AppText variant="caption">No activity history yet  sync health data to track progress.</AppText>
      ) : (
        history.map((h) => (
          <AppCard key={h.date} style={styles.row}>
            <View>
              <AppText variant="bodyStrong">{h.date}</AppText>
              <AppText variant="caption">
                {h.steps > 0 ? `${h.steps.toLocaleString()} steps` : 'Daily plan'}
              </AppText>
            </View>
            <AppText
              variant="caption"
              color={h.followed ? Colors.light.success : Colors.light.warning}
            >
              {h.followed ? 'Followed' : 'Partial'}
            </AppText>
          </AppCard>
        ))
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  centered: { alignItems: 'center', padding: Spacing.four },
  row: {
    marginBottom: Spacing.two,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
