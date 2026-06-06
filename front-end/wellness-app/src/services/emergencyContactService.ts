import { apiDelete, apiGet, apiPost, apiPut, unwrap } from '@/lib/api/client';
import type { ApiResponse, EmergencyContact } from '@/lib/api/types';

export type EmergencyContactInput = {
  name: string;
  phone_number: string;
  relationship: string;
  is_primary: boolean;
};

const CONTACTS_PATH = '/api/v1/emergency/contacts';

export function fetchEmergencyContacts(): Promise<EmergencyContact[]> {
  return apiGet<ApiResponse<EmergencyContact[]>>(CONTACTS_PATH).then(unwrap);
}

export function createEmergencyContact(input: EmergencyContactInput): Promise<EmergencyContact> {
  return apiPost<ApiResponse<EmergencyContact>>(CONTACTS_PATH, input).then(unwrap);
}

export function updateEmergencyContact(
  contactId: string,
  input: EmergencyContactInput,
): Promise<EmergencyContact> {
  return apiPut<ApiResponse<EmergencyContact>>(`${CONTACTS_PATH}/${contactId}`, input).then(unwrap);
}

export function deleteEmergencyContact(contactId: string): Promise<void> {
  return apiDelete(`${CONTACTS_PATH}/${contactId}`);
}
