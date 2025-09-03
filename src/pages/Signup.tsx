import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, Upload, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as 'student' | 'institution',
    category: 'GEN' as 'GEN' | 'SC' | 'ST' | 'EWS',
    description: ''
  });
  const [documents, setDocuments] = useState({
    aadhar: null as File | null,
    category: null as File | null,
    registration: null as File | null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, documentType: 'aadhar' | 'category' | 'registration') => {
    const file = e.target.files?.[0] || null;
    
    // Validate file size (5MB limit)
    if (file && file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (file && !allowedTypes.includes(file.type)) {
      setError('Only PDF, JPG, and PNG files are allowed');
      return;
    }
    
    setError('');
    setDocuments(prev => ({
      ...prev,
      [documentType]: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsSubmitting(false);
      return;
    }

    // Validate required documents
    if (formData.role === 'student') {
      if (!documents.aadhar) {
        setError('Aadhar card document is required');
        setIsSubmitting(false);
        return;
      }
      if (formData.category !== 'GEN' && !documents.category) {
        setError('Category certificate is required for SC/ST/EWS students');
        setIsSubmitting(false);
        return;
      }
    } else if (formData.role === 'institution') {
      if (!documents.registration) {
        setError('Institution registration document is required');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        approved: false,
        verified: false,
        createdAt: new Date(),
        ...(formData.role === 'student' ? {
          category: formData.category,
          appliedCourses: [],
          enrolledCourses: []
        } : {
          description: formData.description,
          courses: [],
          studentsEnrolled: 0
        })
      };

      await signup(formData.email, formData.password, userData);
      navigate('/');
    } catch (error: any) {
      setError(error.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Account Type *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              >
                <option value="student">Student</option>
                <option value="institution">Institution</option>
              </select>
            </div>

            {formData.role === 'student' && (
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                >
                  <option value="GEN">General (GEN)</option>
                  <option value="SC">Scheduled Caste (SC)</option>
                  <option value="ST">Scheduled Tribe (ST)</option>
                  <option value="EWS">Economically Weaker Section (EWS)</option>
                </select>
              </div>
            )}

            {formData.role === 'institution' && (
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Institution Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Describe your institution"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h3>
              
              {formData.role === 'student' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aadhar Card * <span className="text-xs text-gray-500">(PDF, JPG, PNG - Max 5MB)</span>
                    </label>
                    <div className="flex items-center space-x-3">
                      <label className="cursor-pointer bg-gray-50 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 flex items-center space-x-2">
                        <Upload className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-700">Choose File</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange(e, 'aadhar')}
                          className="hidden"
                        />
                      </label>
                      {documents.aadhar && (
                        <span className="text-sm text-green-600 flex items-center space-x-1">
                          <FileText className="h-4 w-4" />
                          <span>{documents.aadhar.name}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {formData.category !== 'GEN' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category Certificate ({formData.category}) * <span className="text-xs text-gray-500">(PDF, JPG, PNG - Max 5MB)</span>
                      </label>
                      <div className="flex items-center space-x-3">
                        <label className="cursor-pointer bg-gray-50 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 flex items-center space-x-2">
                          <Upload className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-700">Choose File</span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, 'category')}
                            className="hidden"
                          />
                        </label>
                        {documents.category && (
                          <span className="text-sm text-green-600 flex items-center space-x-1">
                            <FileText className="h-4 w-4" />
                            <span>{documents.category.name}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {formData.role === 'institution' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institution Registration Document * <span className="text-xs text-gray-500">(PDF, JPG, PNG - Max 5MB)</span>
                  </label>
                  <div className="flex items-center space-x-3">
                    <label className="cursor-pointer bg-gray-50 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 flex items-center space-x-2">
                      <Upload className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">Choose File</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, 'registration')}
                        className="hidden"
                      />
                    </label>
                    {documents.registration && (
                      <span className="text-sm text-green-600 flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>{documents.registration.name}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                <strong>Verification Required:</strong> Your account will be in "Unverified" status until an admin reviews and approves your documents. 
                {formData.role === 'student' ? ' You can apply for courses only after verification.' : ' You can add courses only after verification.'}
              </p>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-md p-3">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Create Account & Submit for Verification'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;