import { useLocalSearchParams } from 'expo-router';
import { ChallengeProgressScreen } from '@/screens/challenges/ChallengeProgressScreen';

export default function ChallengeProgressRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ChallengeProgressScreen challengeId={id ?? ''} />;
}
