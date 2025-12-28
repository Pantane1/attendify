
export enum UserRole {
  STUDENT = 'STUDENT',
  LECTURER = 'LECTURER',
}

export interface Student {
  id: string;
  name: string;
  studentId: string;
  profileImage?: string; // Base64
  email: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  lecturerId: string;
  startTime: string; // HH:mm format, e.g., "09:00"
  daysOfWeek: string[]; // e.g., ["Monday", "Wednesday"]
  earlyBuffer: number; // minutes before start to allow check-in
  lateBuffer: number; // minutes after start to mark as late instead of absent/normal
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  timestamp: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  confidenceScore: number;
}

export interface VerificationResult {
  match: boolean;
  confidence: number;
  message: string;
}
