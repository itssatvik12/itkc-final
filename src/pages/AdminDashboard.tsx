import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, query, where, deleteDoc, addDoc } from 'firebase/firestore';
import { Users, BookOpen, MessageSquare, CheckCircle, XCircle, Edit, Trash2, Building, FileText, Plus } from 'lucide-react';
import { db } from '../config/firebase';
import { Institution, Student, Feedback, Course, AdminCourse, InstitutionCourseApplication, StudentCourseApplication } from '../types';

const AdminDashboard: React.FC = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [adminCourses, setAdminCourses] = useState<AdminCourse[]>([]);
  const [institutionApplications, setInstitutionApplications] = useState<InstitutionCourseApplication[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentApplications, setStudentApplications] = useState<StudentCourseApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'institutions' | 'students' | 'admin-courses' | 'institution-applications' | 'courses' | 'student-applications' | 'feedback'>('institutions');
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showEnrollStudent, setShowEnrollStudent] = useState(false);
  const [enrollmentForm, setEnrollmentForm] = useState({
    studentId: '',
    courseId: ''
  });
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    duration: '',
    price: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const institutionsData: Institution[] = [];
        const studentsData: Student[] = [];
        
        usersSnapshot.docs.forEach(doc => {
          const userData = doc.data();
          const createdAt = (userData.createdAt && typeof userData.createdAt.toDate === 'function') 
            ? userData.createdAt.toDate() 
            : (userData.createdAt ? new Date(userData.createdAt) : new Date());
          
          if (userData.role === 'institution') {
            institutionsData.push({
              id: doc.id,
              name: userData.name || '',
              email: userData.email || '',
              role: 'institution',
              description: userData.description || '',
              approved: userData.approved || false,
              verified: userData.verified || false,
              courses: userData.courses || [],
              studentsEnrolled: userData.studentsEnrolled || 0,
              createdAt
            });
          } else if (userData.role === 'student') {
            studentsData.push({
              id: doc.id,
              name: userData.name || '',
              email: userData.email || '',
              role: 'student',
              category: userData.category || 'GEN',
              approved: userData.approved || false,
              verified: userData.verified || false,
              appliedCourses: userData.appliedCourses || [],
              enrolledCourses: userData.enrolledCourses || [],
              createdAt
            });
          }
        });
        
        setInstitutions(institutionsData);
        setStudents(studentsData);

        // Fetch admin courses
        const adminCoursesSnapshot = await getDocs(collection(db, 'adminCourses'));
        const adminCoursesData = adminCoursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: (doc.data().createdAt && typeof doc.data().createdAt.toDate === 'function') 
            ? doc.data().createdAt.toDate() 
            : (doc.data().createdAt ? new Date(doc.data().createdAt) : new Date())
        })) as AdminCourse[];
        setAdminCourses(adminCoursesData);

        // Fetch institution course applications
        const institutionAppsSnapshot = await getDocs(collection(db, 'institutionCourseApplications'));
        const institutionAppsData = institutionAppsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          appliedAt: (doc.data().appliedAt && typeof doc.data().appliedAt.toDate === 'function') 
            ? doc.data().appliedAt.toDate() 
            : (doc.data().appliedAt ? new Date(doc.data().appliedAt) : new Date()),
          reviewedAt: (doc.data().reviewedAt && typeof doc.data().reviewedAt.toDate === 'function') 
            ? doc.data().reviewedAt.toDate() 
            : (doc.data().reviewedAt ? new Date(doc.data().reviewedAt) : null)
        })) as InstitutionCourseApplication[];
        setInstitutionApplications(institutionAppsData);

        // Fetch approved courses
        const coursesSnapshot = await getDocs(collection(db, 'courses'));
        const coursesData = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: (doc.data().createdAt && typeof doc.data().createdAt.toDate === 'function') 
            ? doc.data().createdAt.toDate() 
            : (doc.data().createdAt ? new Date(doc.data().createdAt) : new Date())
        })) as Course[];
        setCourses(coursesData);

        // Fetch student applications
        const studentAppsSnapshot = await getDocs(collection(db, 'studentCourseApplications'));
        const studentAppsData = studentAppsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          appliedAt: (doc.data().appliedAt && typeof doc.data().appliedAt.toDate === 'function') 
            ? doc.data().appliedAt.toDate() 
            : (doc.data().appliedAt ? new Date(doc.data().appliedAt) : new Date()),
          reviewedAt: (doc.data().reviewedAt && typeof doc.data().reviewedAt.toDate === 'function') 
            ? doc.data().reviewedAt.toDate() 
            : (doc.data().reviewedAt ? new Date(doc.data().reviewedAt) : null)
        })) as StudentCourseApplication[];
        setStudentApplications(studentAppsData);

        // Fetch feedback
        const feedbackSnapshot = await getDocs(collection(db, 'feedback'));
        const feedbackData: Feedback[] = [];
        feedbackSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const createdAt = (data.createdAt && typeof data.createdAt.toDate === 'function') 
            ? data.createdAt.toDate() 
            : (data.createdAt ? new Date(data.createdAt) : new Date());
          feedbackData.push({
            id: doc.id,
            name: data.name || '',
            email: data.email || '',
            message: data.message || '',
            createdAt
          });
        });
        
        // Also fetch contacts
        const contactsSnapshot = await getDocs(collection(db, 'contacts'));
        const contactsData: Feedback[] = [];
        contactsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const createdAt = (data.createdAt && typeof data.createdAt.toDate === 'function') 
            ? data.createdAt.toDate() 
            : (data.createdAt ? new Date(data.createdAt) : new Date());
          contactsData.push({
            id: doc.id,
            name: data.name || '',
            email: data.email || '',
            message: data.subject ? `${data.subject}: ${data.message}` : data.message || '',
            createdAt
          });
        });
        
        setFeedback([...feedbackData, ...contactsData]);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApproveInstitution = async (institutionId: string) => {
    try {
      await updateDoc(doc(db, 'users', institutionId), { approved: true });
      setInstitutions(prev => 
        prev.map(inst => 
          inst.id === institutionId ? { ...inst, approved: true } : inst
        )
      );
    } catch (error) {
      console.error('Error approving institution:', error);
    }
  };

  const handleRejectInstitution = async (institutionId: string) => {
    try {
      await updateDoc(doc(db, 'users', institutionId), { approved: false });
      setInstitutions(prev => 
        prev.map(inst => 
          inst.id === institutionId ? { ...inst, approved: false } : inst
        )
      );
    } catch (error) {
      console.error('Error rejecting institution:', error);
    }
  };

  const handleApproveStudent = async (studentId: string) => {
    try {
      await updateDoc(doc(db, 'users', studentId), { approved: true });
      setStudents(prev => 
        prev.map(student => 
          student.id === studentId ? { ...student, approved: true } : student
        )
      );
    } catch (error) {
      console.error('Error approving student:', error);
    }
  };

  const handleRejectStudent = async (studentId: string) => {
    try {
      await updateDoc(doc(db, 'users', studentId), { approved: false });
      setStudents(prev => 
        prev.map(student => 
          student.id === studentId ? { ...student, approved: false } : student
        )
      );
    } catch (error) {
      console.error('Error rejecting student:', error);
    }
  };

  const handleAddAdminCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (adminCourses.length >= 13) {
      alert('Maximum of 13 admin courses allowed.');
      return;
    }

    try {
      const courseData = {
        ...courseForm,
        createdAt: new Date(),
        createdBy: 'admin' // In a real app, this would be the current admin's ID
      };

      const docRef = await addDoc(collection(db, 'adminCourses'), courseData);
      const newCourse = { id: docRef.id, ...courseData } as AdminCourse;
      setAdminCourses(prev => [...prev, newCourse]);
      
      setCourseForm({ title: '', description: '', duration: '', price: 0 });
      setShowAddCourse(false);
      alert('Admin course created successfully! Institutions can now apply for this course.');
    } catch (error) {
      console.error('Error adding admin course:', error);
      alert('Failed to add course. Please try again.');
    }
  };

  const handleDeleteAdminCourse = async (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course? This will affect all related applications.')) {
      try {
        await deleteDoc(doc(db, 'adminCourses', courseId));
        setAdminCourses(prev => prev.filter(course => course.id !== courseId));
      } catch (error) {
        console.error('Error deleting admin course:', error);
      }
    }
  };

  const handleApproveInstitutionApplication = async (applicationId: string) => {
    try {
      const application = institutionApplications.find(app => app.id === applicationId);
      if (!application) return;

      // Update application status
      await updateDoc(doc(db, 'institutionCourseApplications', applicationId), {
        status: 'approved',
        reviewedAt: new Date()
      });

      // Create the actual course
      const adminCourse = adminCourses.find(course => course.id === application.adminCourseId);
      if (adminCourse) {
        await addDoc(collection(db, 'courses'), {
          title: adminCourse.title,
          description: adminCourse.description,
          duration: adminCourse.duration,
          price: adminCourse.price,
          institutionId: application.institutionId,
          institutionName: application.institutionName,
          adminCourseId: application.adminCourseId,
          enrolledStudents: 0,
          maxEnrollment: 20,
          approved: true,
          createdAt: new Date()
        });
      }

      // Update local state
      setInstitutionApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: 'approved', reviewedAt: new Date() } : app
      ));

      alert('Institution application approved! Course is now available for students.');
    } catch (error) {
      console.error('Error approving institution application:', error);
    }
  };

  const handleRejectInstitutionApplication = async (applicationId: string) => {
    try {
      await updateDoc(doc(db, 'institutionCourseApplications', applicationId), {
        status: 'rejected',
        reviewedAt: new Date()
      });

      setInstitutionApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: 'rejected', reviewedAt: new Date() } : app
      ));
    } catch (error) {
      console.error('Error rejecting institution application:', error);
    }
  };

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const student = students.find(s => s.id === enrollmentForm.studentId);
      const course = courses.find(c => c.id === enrollmentForm.courseId);
      
      if (!student || !course) {
        alert('Invalid student or course selection');
        return;
      }

      // Check if student is already enrolled
      const existingApplication = studentApplications.find(
        app => app.studentId === enrollmentForm.studentId && 
               app.courseId === enrollmentForm.courseId
      );
      
      if (existingApplication) {
        alert('Student has already applied for this course');
        return;
      }

      // Check course capacity
      if (course.enrolledStudents >= 20) {
        alert('Course has reached maximum capacity');
        return;
      }

      // Create approved student application
      const applicationData = {
        courseId: course.id,
        courseTitle: course.title,
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        studentCategory: student.category,
        institutionId: course.institutionId,
        status: 'approved' as const,
        appliedAt: new Date(),
        reviewedAt: new Date(),
        reviewedBy: 'admin'
      };

      const docRef = await addDoc(collection(db, 'studentCourseApplications'), applicationData);
      const newApplication = { id: docRef.id, ...applicationData } as StudentCourseApplication;
      setStudentApplications(prev => [...prev, newApplication]);

      // Update course enrollment count
      await updateDoc(doc(db, 'courses', course.id), {
        enrolledStudents: course.enrolledStudents + 1
      });

      // Update local course state
      setCourses(prev => prev.map(c => 
        c.id === course.id ? { ...c, enrolledStudents: c.enrolledStudents + 1 } : c
      ));
      
      setEnrollmentForm({ studentId: '', courseId: '' });
      setShowEnrollStudent(false);
      alert('Student enrolled successfully!');
    } catch (error) {
      console.error('Error enrolling student:', error);
      alert('Failed to enroll student. Please try again.');
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    try {
      await deleteDoc(doc(db, 'feedback', feedbackId));
      setFeedback(prev => prev.filter(f => f.id !== feedbackId));
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const pendingInstitutions = institutions.filter(inst => !inst.approved);
  const pendingInstitutionApplications = institutionApplications.filter(app => app.status === 'pending');
  const pendingStudentApplications = studentApplications.filter(app => app.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage institutions, courses, and platform content</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Institutions</p>
                <p className="text-2xl font-bold text-gray-900">{institutions.length}</p>
                {pendingInstitutions.length > 0 && (
                  <p className="text-sm text-orange-600">{pendingInstitutions.length} pending</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-2xl font-bold text-gray-900">{students.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Admin Courses</p>
                <p className="text-2xl font-bold text-gray-900">{adminCourses.length}/13</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-2xl font-bold text-gray-900">{pendingInstitutionApplications.length + pendingStudentApplications.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'institutions', label: 'Institutions', icon: Building },
                { key: 'students', label: 'Students', icon: Users },
                { key: 'admin-courses', label: 'Admin Courses', icon: BookOpen },
                { key: 'institution-applications', label: 'Institution Apps', icon: FileText },
                { key: 'courses', label: 'Active Courses', icon: CheckCircle },
                { key: 'student-applications', label: 'Student Apps', icon: Users },
                { key: 'feedback', label: 'Feedback', icon: MessageSquare }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'institutions' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Institution Management</h2>
                {institutions.length === 0 ? (
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No institutions registered yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institution</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {institutions.map((institution) => (
                          <tr key={institution.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{institution.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{institution.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                institution.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {institution.approved ? 'Approved' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                {!institution.approved && (
                                  <button
                                    onClick={() => handleApproveInstitution(institution.id)}
                                    className="text-green-600 hover:text-green-900 p-1"
                                    title="Approve Institution"
                                  >
                                    <CheckCircle className="h-5 w-5" />
                                  </button>
                                )}
                                {institution.approved && (
                                  <button
                                    onClick={() => handleRejectInstitution(institution.id)}
                                    className="text-red-600 hover:text-red-900 p-1"
                                    title="Revoke Approval"
                                  >
                                    <XCircle className="h-5 w-5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'students' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Student Management</h2>
                {students.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No students registered yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled Courses</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student) => (
                          <tr key={student.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{student.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                student.category === 'GEN' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {student.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                student.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {student.approved ? 'Approved' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{student.enrolledCourses?.length || 0}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                {!student.approved && (
                                  <button
                                    onClick={() => handleApproveStudent(student.id)}
                                    className="text-green-600 hover:text-green-900 p-1"
                                    title="Approve Student"
                                  >
                                    <CheckCircle className="h-5 w-5" />
                                  </button>
                                )}
                                {student.approved && (
                                  <button
                                    onClick={() => handleRejectStudent(student.id)}
                                    className="text-red-600 hover:text-red-900 p-1"
                                    title="Revoke Approval"
                                  >
                                    <XCircle className="h-5 w-5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'admin-courses' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Admin Course Templates ({adminCourses.length}/13)</h2>
                  <button
                    onClick={() => setShowAddCourse(true)}
                    disabled={adminCourses.length >= 13}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-5 w-5" />
                    <span>{adminCourses.length >= 13 ? 'Limit Reached' : 'Add Course'}</span>
                  </button>
                </div>
                
                {adminCourses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No admin courses created yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {adminCourses.map((course) => (
                      <div key={course.id} className="border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{course.title}</h3>
                        <p className="text-gray-600 mb-3 line-clamp-3">{course.description}</p>
                        <div className="text-sm text-gray-500 mb-4">
                          <p>Duration: {course.duration}</p>
                          <p>Price: ${course.price}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-blue-600">
                            {institutionApplications.filter(app => app.adminCourseId === course.id).length} applications
                          </span>
                          <button
                            onClick={() => handleDeleteAdminCourse(course.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete Course"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'institution-applications' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Institution Course Applications</h2>
                {institutionApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No institution applications yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institution</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {institutionApplications.map((application) => (
                          <tr key={application.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{application.institutionName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{application.adminCourseTitle}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                application.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : application.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {application.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {application.appliedAt.toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {application.status === 'pending' && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleApproveInstitutionApplication(application.id)}
                                    className="text-green-600 hover:text-green-900 p-1"
                                    title="Approve Application"
                                  >
                                    <CheckCircle className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => handleRejectInstitutionApplication(application.id)}
                                    className="text-red-600 hover:text-red-900 p-1"
                                    title="Reject Application"
                                  >
                                    <XCircle className="h-5 w-5" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'courses' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Courses</h2>
                {courses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No active courses yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institution</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {courses.map((course) => (
                          <tr key={course.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{course.title}</div>
                                <div className="text-sm text-gray-500">{course.duration}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{course.institutionName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">${course.price}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{course.enrolledStudents}/20</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'student-applications' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Student Course Applications</h2>
                {studentApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No student applications yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {studentApplications.map((application) => (
                          <tr key={application.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{application.studentName}</div>
                                <div className="text-sm text-gray-500">{application.studentEmail}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{application.courseTitle}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                application.studentCategory === 'GEN' 
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
                                {application.studentCategory}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                application.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : application.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {application.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {application.appliedAt.toLocaleDateString()}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'feedback' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">User Feedback</h2>
                {feedback.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No feedback received yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {feedback.map((item) => (
                      <div key={item.id} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                              <span className="text-gray-500">{item.email}</span>
                            </div>
                            <p className="text-gray-700 mb-2">{item.message}</p>
                            <p className="text-sm text-gray-500">
                              {item.createdAt instanceof Date ? item.createdAt.toLocaleDateString() : new Date(item.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteFeedback(item.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete Feedback"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Add Course Modal */}
        {showAddCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Add Admin Course Template</h3>
              
              <form onSubmit={handleAddAdminCourse} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                  <input
                    type="text"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={courseForm.description}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, duration: e.target.value }))}
                    required
                    placeholder="e.g., 8 weeks"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Course Template
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddCourse(false)}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
        {/* Enroll Student Modal */}
        {showEnrollStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Enroll Student in Course</h3>
              
              <form onSubmit={handleEnrollStudent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
                  <select
                    value={enrollmentForm.studentId}
                    onChange={(e) => setEnrollmentForm(prev => ({ ...prev, studentId: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a student...</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name} ({student.email}) - {student.category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
                  <select
                    value={enrollmentForm.courseId}
                    onChange={(e) => setEnrollmentForm(prev => ({ ...prev, courseId: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a course...</option>
                    {courses.filter(course => course.enrolledStudents < 20).map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title} - {course.institutionName} ({course.enrolledStudents}/20)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This will directly enroll the student in the selected course, bypassing the normal application process.
                  </p>
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Enroll Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEnrollStudent(false)}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
};

export default AdminDashboard;