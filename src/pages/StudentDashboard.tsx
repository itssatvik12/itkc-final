import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, updateDoc, arrayUnion, getDoc, addDoc } from 'firebase/firestore';
import { BookOpen, Clock, DollarSign, Users, CheckCircle, Plus, AlertCircle, FileText } from 'lucide-react';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Course, StudentCourseApplication } from '../types';

const StudentDashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [myApplications, setMyApplications] = useState<StudentCourseApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const { userData } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!userData) return;

      try {
        // Fetch all approved courses
        const coursesQuery = query(collection(db, 'courses'), where('approved', '==', true));
        const snapshot = await getDocs(coursesQuery);
        const coursesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt || new Date()
        })) as Course[];
        setCourses(coursesData);

        // Fetch student's applications
        const applicationsQuery = query(
          collection(db, 'studentCourseApplications'),
          where('studentId', '==', userData.id)
        );
        const applicationsSnapshot = await getDocs(applicationsQuery);
        const applicationsData = applicationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          appliedAt: doc.data().appliedAt?.toDate ? doc.data().appliedAt.toDate() : doc.data().appliedAt || new Date(),
          reviewedAt: doc.data().reviewedAt?.toDate ? doc.data().reviewedAt.toDate() : doc.data().reviewedAt
        })) as StudentCourseApplication[];
        setMyApplications(applicationsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userData]);

  const handleApplyCourse = async (courseId: string) => {
    if (!userData) return;

    // Check if already applied
    const alreadyApplied = myApplications.some(app => app.courseId === courseId);
    if (alreadyApplied) {
      alert('You have already applied for this course.');
      return;
    }

    // Check category-based restrictions
    if (['SC', 'ST', 'EWS'].includes(userData.category) && myApplications.filter(app => app.status !== 'rejected').length > 0) {
      alert('SC/ST/EWS students can only apply for one course at a time.');
      return;
    }

    // Check course enrollment limit
    const course = courses.find(c => c.id === courseId);
    if (course && course.enrolledStudents >= 20) {
      alert('This course has reached its maximum enrollment limit of 20 students.');
      return;
    }

    try {
      // Create student course application
      const applicationData = {
        courseId,
        courseTitle: course?.title || '',
        studentId: userData.id,
        studentName: userData.name,
        studentEmail: userData.email,
        studentCategory: userData.category,
        institutionId: course?.institutionId || '',
        status: 'pending' as const,
        appliedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'studentCourseApplications'), applicationData);
      const newApplication = { id: docRef.id, ...applicationData } as StudentCourseApplication;
      setMyApplications(prev => [...prev, newApplication]);
      
      alert('Application submitted successfully! The institution will review your application.');
    } catch (error) {
      console.error('Error applying for course:', error);
      alert('Failed to submit application. Please try again.');
    }
  };

  const hasApplied = (courseId: string) => myApplications.some(app => app.courseId === courseId);

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
        <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-lg p-8">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Account Under Verification</h2>
          <p className="text-gray-600 mb-6">
            Your account is currently being verified by our admin team. You'll be able to apply for courses once your documents are approved.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              <strong>Status:</strong> Pending verification<br/>
              <strong>Documents submitted:</strong> Under review<br/>
              <strong>Expected time:</strong> 1-2 business days
            </p>
          </div>
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-sm text-yellow-800">
              <strong>Application Rules:</strong><br/>
              • General (GEN) students: Can apply for multiple courses<br/>
              • SC/ST/EWS students: Can apply for only one course at a time<br/>
              • Each course has a maximum of 20 students
            </p>
          </div>
        </div>
      </div>
    );
  }

  const appliedCourses = courses.filter(course => hasApplied(course.id));
  const availableCourses = courses.filter(course => !hasApplied(course.id));
  
  // Check if student can apply for more courses based on category
  const activeApplications = myApplications.filter(app => app.status !== 'rejected');
  const canApplyForMore = userData?.category === 'GEN' || activeApplications.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {userData?.name}! (Category: {userData?.category})</p>
          <div className="mt-2 text-sm text-gray-500">
            {userData?.category === 'GEN' ? (
              <span>✓ You can apply for multiple courses simultaneously</span>
            ) : (
              <span>⚠️ You can only apply for one course at a time ({userData?.category} category restriction)</span>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">My Applications</p>
                <p className="text-2xl font-bold text-gray-900">{myApplications.length}</p>
                {userData?.category !== 'GEN' && activeApplications.length > 0 && (
                  <p className="text-xs text-orange-600">Limit reached for {userData?.category}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Courses</p>
                <p className="text-2xl font-bold text-gray-900">{availableCourses.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Category</p>
                <p className="text-2xl font-bold text-gray-900">{userData?.category}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Restriction Notice */}
        {['SC', 'ST', 'EWS'].includes(userData?.category || '') && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-8">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                <strong>Application Limit:</strong> As a {userData?.category} category student, you can only apply for one course at a time.
                {activeApplications.length > 0 && ' You have already applied for a course.'}
              </p>
            </div>
          </div>
        )}

        {/* Applied Courses */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">My Applications</h2>
          {appliedCourses.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-600">Browse available courses below to submit your first application!</p>
              {userData?.category !== 'GEN' && (
                <p className="text-sm text-yellow-600 mt-2">
                  Remember: As a {userData?.category} student, you can only apply for one course at a time.
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institution</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewed Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {myApplications.map((application) => {
                    const course = courses.find(c => c.id === application.courseId);
                    return (
                      <tr key={application.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{application.courseTitle}</div>
                            {course && (
                              <div className="text-sm text-gray-500">{course.duration} • ${course.price}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{course?.institutionName || 'N/A'}</div>
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Available Courses */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Available Courses</h2>
          {!canApplyForMore && (
            <div className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-6">
              <p className="text-sm text-orange-800">
                <strong>Application Restricted:</strong> As a {userData?.category} category student, you cannot apply for additional courses while you have a pending application. Please wait for your current application to be processed.
              </p>
            </div>
          )}
          {availableCourses.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No more courses available</h3>
              <p className="text-gray-600">You've applied to all available courses. Check back later for new offerings!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm text-blue-600 font-medium">{course.institutionName}</span>
                      {course.enrolledStudents >= 18 && (
                        <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                          Nearly Full
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">{course.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{course.enrolledStudents}/20 enrolled</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <span className="text-xl font-bold text-green-600">${course.price}</span>
                      </div>
                      <button
                        onClick={() => handleApplyCourse(course.id)}
                        disabled={!canApplyForMore || course.enrolledStudents >= 20}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-4 w-4" />
                        <span>
                          {course.enrolledStudents >= 20 ? 'Full' : 'Apply'}
                        </span>
                      </button>
                    </div>
                    
                    {course.enrolledStudents >= 20 && (
                      <div className="mt-3 bg-red-50 border border-red-200 rounded-md p-2">
                        <p className="text-xs text-red-600">
                          This course has reached its maximum enrollment of 20 students.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;