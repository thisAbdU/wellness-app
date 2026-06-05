import { useWindowDimensions } from 'react-native';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export function useContentLayout() {
  const { width, height } = useWindowDimensions();
  const horizontalPadding = Spacing.four * 2;
  const contentWidth = Math.min(Math.max(width - horizontalPadding, 0), MaxContentWidth);
  const isWide = width >= 720;
  const isMedium = width >= 480;

  return {
    width,
    height,
    contentWidth,
    isWide,
    isMedium,
    columns: isWide ? 3 : isMedium ? 2 : 1,
  };
}
