import * as Location from 'expo-location';
import { api } from '@/lib/api';

export type EmergencyAlertResult = {
  queued: number;
  locationShared: boolean;
};

export async function sendEmergencyAlertWithLocation(): Promise<EmergencyAlertResult> {
  let latitude: number | undefined;
  let longitude: number | undefined;

  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status === 'granted') {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
  }

  const result = await api.emergency.notify(latitude, longitude);
  return {
    queued: result.queued,
    locationShared: latitude !== undefined && longitude !== undefined,
  };
}
