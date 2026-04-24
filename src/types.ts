/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VitalRecord {
  id: string;
  type: 'Blood Pressure' | 'Heart Rate' | 'Blood Sugar' | 'Weight' | 'Steps' | 'Oxygen';
  value: string;
  unit: string;
  timestamp: number;
  source?: 'manual' | 'watch';
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Appointment {
  id: string;
  title: string;
  doctor: string;
  date: string;
  time: string;
  location: string;
}

export interface UserProfile {
  name: string;
  age: string;
  emergencyContact: string;
  allergies: string;
  notificationsEnabled: boolean;
}

export interface PatientData {
  id: string;
  profile: UserProfile;
  meds: Medication[];
  vitals: VitalRecord[];
  appointments: Appointment[];
  chatHistory: ChatMessage[];
}

export type View = 'home' | 'companion' | 'vitals' | 'meds' | 'monitor' | 'calendar' | 'settings' | 'caregiver';
