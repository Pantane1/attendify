
import { Student, Course, AttendanceRecord } from '../types';

const STORAGE_KEYS = {
  STUDENTS: 'eduface_students',
  COURSES: 'eduface_courses',
  ATTENDANCE: 'eduface_attendance',
};

// Initial Mock Data
const DEFAULT_STUDENTS: Student[] = [
  { id: '1', name: 'Alex Thompson', studentId: 'S101', email: 'alex@uni.edu', profileImage: 'https://picsum.photos/seed/alex/200' },
  { id: '2', name: 'Sarah Chen', studentId: 'S102', email: 'sarah@uni.edu', profileImage: 'https://picsum.photos/seed/sarah/200' },
  { id: '3', name: 'Marcus Miller', studentId: 'S103', email: 'marcus@uni.edu', profileImage: 'https://picsum.photos/seed/marcus/200' },
];

const DEFAULT_COURSES: Course[] = [
  // Fixed: Added missing daysOfWeek, earlyBuffer, and lateBuffer properties
  { 
    id: 'c1', 
    code: 'CS101', 
    name: 'Introduction to AI', 
    lecturerId: 'l1', 
    startTime: '09:00',
    daysOfWeek: ['Monday', 'Wednesday', 'Friday'],
    earlyBuffer: 15,
    lateBuffer: 10
  },
  // Fixed: Added missing daysOfWeek, earlyBuffer, and lateBuffer properties
  { 
    id: 'c2', 
    code: 'CS202', 
    name: 'Database Management', 
    lecturerId: 'l1', 
    startTime: '14:30',
    daysOfWeek: ['Tuesday', 'Thursday'],
    earlyBuffer: 15,
    lateBuffer: 10
  },
];

export const dbService = {
  getStudents: (): Student[] => {
    const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return data ? JSON.parse(data) : DEFAULT_STUDENTS;
  },
  
  saveStudent: (student: Student) => {
    const students = dbService.getStudents();
    const index = students.findIndex(s => s.id === student.id);
    if (index > -1) {
      students[index] = student;
    } else {
      students.push(student);
    }
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  },

  deleteStudent: (id: string) => {
    const students = dbService.getStudents().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    
    // Optional: Clean up attendance for deleted student
    const attendance = dbService.getAttendance().filter(a => a.studentId !== id);
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  },

  getCourses: (): Course[] => {
    const data = localStorage.getItem(STORAGE_KEYS.COURSES);
    return data ? JSON.parse(data) : DEFAULT_COURSES;
  },

  saveCourse: (course: Course) => {
    const courses = dbService.getCourses();
    const index = courses.findIndex(c => c.id === course.id);
    if (index > -1) {
      courses[index] = course;
    } else {
      courses.push(course);
    }
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  },

  getAttendance: (): AttendanceRecord[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return data ? JSON.parse(data) : [];
  },

  markAttendance: (record: AttendanceRecord) => {
    const history = dbService.getAttendance();
    // Check if already marked for same day/course
    const today = new Date().toISOString().split('T')[0];
    const exists = history.some(h => 
      h.studentId === record.studentId && 
      h.courseId === record.courseId && 
      h.timestamp.startsWith(today)
    );
    
    if (!exists) {
      history.push(record);
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(history));
      return true;
    }
    return false;
  }
};
