export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student' | 'institution';
  approved: boolean;
  verified: boolean;
  createdAt: Date;
  category?: 'GEN' | 'SC' | 'ST' | 'EWS'; // For students
  description?: string; // For institutions
  appliedCourses?: string[]; // For students
  enrolledCourses?: string[]; // For students
  courses?: string[]; // For institutions
  studentsEnrolled?: number; // For institutions
}

export interface Student extends User {
  role: 'student';
  category: 'GEN' | 'SC' | 'ST' | 'EWS';
  appliedCourses: string[];
  enrolledCourses: string[];
}

export interface Institution extends User {
  role: 'institution';
  description: string;
  courses: string[];
  studentsEnrolled: number;
}

export interface AdminCourse {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  createdAt: Date;
  createdBy: string; // Admin ID
}

export interface InstitutionCourseApplication {
  id: string;
  adminCourseId: string;
  adminCourseTitle: string;
  institutionId: string;
  institutionName: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string; // Admin ID
}

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  institutionId: string;
  institutionName: string;
  adminCourseId: string; // Reference to the admin template course
  enrolledStudents: number;
  maxEnrollment: number;
  approved: boolean;
  createdAt: Date;
}

export interface StudentCourseApplication {
  id: string;
  courseId: string;
  courseTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentCategory: 'GEN' | 'SC' | 'ST' | 'EWS';
  institutionId: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string; // Institution ID
  paymentStatus?: 'free' | 'paid' | 'pending';
  amountPaid?: number;
}

export interface Feedback {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
}