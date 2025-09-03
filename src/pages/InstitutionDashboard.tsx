import React, { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { BookOpen, Plus, Edit, Trash2, Users, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Course, AdminCourse, InstitutionCourseApplication, StudentCourseApplication } from '../types';

const InstitutionDashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [adminCourses, setAdminCourses] = useState<AdminCourse[]>([]);
  const [myApplications, setMyApplications] = useState<InstitutionCourseApplication[]>([]);
  const [studentApplications, setStudentApplications] = useState<StudentCourseApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'admin-courses' | 'my-applications' | 'my-courses' | 'student-applications'>('admin-courses');
  const { userData } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!userData) return;

      try {
        // Fetch admin courses available for application
        const adminCoursesSnapshot = await getDocs(collection(db, 'adminCourses'));
        const adminCoursesData = adminCoursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt || new Date()
        })) as AdminCourse[];
        setAdminCourses(adminCoursesData);

        // Fetch institution's applications
        const applicationsQuery = query(
          collection(db, 'institutionCourseApplications'),
          where('institutionId', '==', userData.id)
        );
        const applicationsSnapshot = await getDocs(applicationsQuery);
        const applicationsData = applicationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          appliedAt: doc.data().appliedAt?.toDate ? doc.data().appliedAt.toDate() : doc.data().appliedAt || new Date(),
          reviewedAt: doc.data().reviewedAt?.toDate ? doc.data().reviewedAt.toDate() : doc.data().reviewedAt
        })) as InstitutionCourseApplication[];
        setMyApplications(applicationsData);

        // Fetch institution's approved courses
        const coursesQuery = query(
          collection(db, 'courses'),
          where('institutionId', '==', userData.id)
        );
        const coursesSnapshot = await getDocs(coursesQuery);
        const coursesData = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt || new Date()
        })) as Course[];
        setCourses(coursesData);

        // Fetch student applications for institution's courses
        const courseIds = coursesData.map(course => course.id);
        if (courseIds.length > 0) {
          const studentAppsQuery = query(
            collection(db, 'studentCourseApplications'),
            where('institutionId', '==', userData.id)
          );
          const studentAppsSnapshot = await getDocs(studentAppsQuery);
          const studentAppsData = studentAppsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            appliedAt: doc.data().appliedAt?.toDate ? doc.data().appliedAt.toDate() : doc.data().appliedAt || new Date(),
            reviewedAt: doc.data().reviewedAt?.toDate ? doc.data().reviewedAt.toDate() : doc.data().reviewedAt
          })) as StudentCourseApplication[];
          setStudentApplications(studentAppsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userData]);

  const handleApplyForCourse = async (adminCourseId: string, adminCourseTitle: string) => {
    if (!userData || !userData.approved) return;

    // Check if already applied
    const alreadyApplied = myApplications.some(app => app.adminCourseId === adminCourseId);
    if (alreadyApplied) {
      alert('You have already applied for this course.');
      return;
    }

    // Check application limit (max 5 applications)
    const pendingApplications = myApplications.filter(app => app.status === 'pending').length;
    const approvedApplications = myApplications.filter(app => app.status === 'approved').length;
    
    if (pendingApplications + approvedApplications >= 5) {
      alert('You have reached the maximum limit of 5 course applications.');
      return;
    }

    try {
      const applicationData = {
        adminCourseId,
        adminCourseTitle,
        institutionId: userData.id,
        institutionName: userData.name,
        status: 'pending' as const,
        appliedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'institutionCourseApplications'), applicationData);
      const newApplication = { id: docRef.id, ...applicationData } as InstitutionCourseApplication;
      setMyApplications(prev => [...prev, newApplication]);
      
      alert('Application submitted successfully! Admin will review your application.');
    } catch (error) {
      console.error('Error applying for course:', error);
      alert('Failed to submit application. Please try again.');
    }
  };

  const handleStudentApplicationAction = async (applicationId: string, action: 'approve' | 'reject') => {
    try {
      await updateDoc(doc(db, 'studentCourseApplications', applicationId), {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewedAt: new Date()
      });

      // If approved, increment course enrollment
      if (action === 'approve') {
        const application = studentApplications.find(app => app.id === applicationId);
        if (application) {
          const courseRef = doc(db, 'courses', application.courseId);
          await updateDoc(courseRef, {
            enrolledStudents: (courses.find(c => c.id === application.courseId)?.enrolledStudents || 0) + 1
          });
          
          // Update local state
          setCourses(prev => prev.map(course => 
            course.id === application.courseId 
              ? { ...course, enrolledStudents: (course.enrolledStudents || 0) + 1 }
              : course
          ));
        }
      }

      // Update local state
      setStudentApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: action === 'approve' ? 'approved' : 'rejected', reviewedAt: new Date() } : app
      ));
      
      alert(`Student application ${action}d successfully!`);
    } catch (error) {
      console.error(`Error ${action}ing student application:`, error);
      alert(`Failed to ${action} application. Please try again.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userData?.approved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Pending Approval</h2>
          <p className="text-gray-600 mb-6">
            Your institution account is pending admin approval. Once approved, you'll be able to apply for courses.
          </p>
          <p className="text-sm text-gray-500">
            This usually takes 1-2 business days. You'll receive an email notification once approved.
          </p>
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              <strong>New Process:</strong> You can now apply for up to 5 courses from our admin-created course templates. Once approved by admin, your courses will be available to students.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const appliedCourseIds = myApplications.map(app => app.adminCourseId);
  const availableAdminCourses = adminCourses.filter(course => !appliedCourseIds.includes(course.id));
  const canApplyForMore = myApplications.filter(app => ['pending', 'approved'].includes(app.status)).length < 5;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Institution Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {userData?.name}!</p>
          <p className="text-sm text-gray-500 mt-1">
            Applications: {myApplications.filter(app => ['pending', 'approved'].includes(app.status)).length}/5 | 
            Active Courses: {courses.length} | 
            Total Students: {courses.reduce((sum, course) => sum + (course.enrolledStudents || 0), 0)}
          </p>
        </div>

        {/* Application Limit Warning */}
        {myApplications.filter(app => ['pending', 'approved'].includes(app.status)).length >= 4 && (
          <div className="mb-8 bg-orange-50 border border-orange-200 rounded-md p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <p className="text-sm text-orange-800">
                <strong>Application Limit Warning:</strong> You have {myApplications.filter(app => ['pending', 'approved'].includes(app.status)).length}/5 applications. 
                {myApplications.filter(app => ['pending', 'approved'].includes(app.status)).length === 5 ? ' You have reached the maximum limit.' : ` You can submit ${5 - myApplications.filter(app => ['pending', 'approved'].includes(app.status)).length} more application${5 - myApplications.filter(app => ['pending', 'approved'].includes(app.status)).length === 1 ? '' : 's'}.`}
              </p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-2xl font-bold text-gray-900">{myApplications.filter(app => ['pending', 'approved'].includes(app.status)).length}/5</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Courses</p>
                <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {courses.reduce((sum, course) => sum + (course.enrolledStudents || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Student Apps</p>
                <p className="text-2xl font-bold text-gray-900">{studentApplications.length}</p>
                {studentApplications.filter(app => app.status === 'pending').length > 0 && (
                  <p className="text-sm text-orange-600">{studentApplications.filter(app => app.status === 'pending').length} pending</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'admin-courses', label: 'Available Courses', icon: BookOpen },
                { key: 'my-applications', label: 'My Applications', icon: FileText },
                { key: 'my-courses', label: 'My Courses', icon: CheckCircle },
                { key: 'student-applications', label: 'Student Applications', icon: Users }
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
            {activeTab === 'admin-courses' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Course Templates</h2>
                {!canApplyForMore && (
                  <div className="mb-6 bg-orange-50 border border-orange-200 rounded-md p-4">
                    <p className="text-sm text-orange-800">
                      <strong>Application Limit Reached:</strong> You have reached the maximum of 5 course applications. You cannot apply for more courses at this time.
                    </p>
                  </div>
                )}
                {availableAdminCourses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {adminCourses.length === 0 
                        ? 'No course templates available yet. Admin will add courses soon.' 
                        : 'You have applied for all available courses.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableAdminCourses.map((course) => (
                      <div key={course.id} className="border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{course.title}</h3>
                        <p className="text-gray-600 mb-3 line-clamp-3">{course.description}</p>
                        <div className="text-sm text-gray-500 mb-4">
                          <p>Duration: {course.duration}</p>
                          <p>Price: ${course.price}</p>
                        </div>
                        <button
                          onClick={() => handleApplyForCourse(course.id, course.title)}
                          disabled={!canApplyForMore}
                          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-4 w-4" />
                          <span>{canApplyForMore ? 'Apply for Course' : 'Limit Reached'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'my-applications' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">My Course Applications</h2>
                {myApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No applications submitted yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewed Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {myApplications.map((application) => (
                          <tr key={application.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{application.adminCourseTitle}</div>
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
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {application.reviewedAt ? application.reviewedAt.toLocaleDateString() : 'Pending'}
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

            {activeTab === 'my-courses' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">My Active Courses</h2>
                {courses.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No active courses yet. Apply for course templates and wait for admin approval.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                      <div key={course.id} className="border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{course.title}</h3>
                        <p className="text-gray-600 mb-3 line-clamp-3">{course.description}</p>
                        <div className="text-sm text-gray-500 mb-4">
                          <p>Duration: {course.duration}</p>
                          <p>Price: ${course.price}</p>
                          <p>Students: {course.enrolledStudents || 0}/20</p>
                          {(course.enrolledStudents || 0) >= 18 && (
                            <p className="text-orange-600 font-medium">Nearly Full!</p>
                          )}
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-md p-3">
                          <p className="text-sm text-green-800">✓ Course is live and accepting student applications</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'student-applications' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Student Applications</h2>
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {application.status === 'pending' && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleStudentApplicationAction(application.id, 'approve')}
                                    className="text-green-600 hover:text-green-900 p-1"
                                    title="Approve Application"
                                  >
                                    <CheckCircle className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => handleStudentApplicationAction(application.id, 'reject')}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionDashboard;