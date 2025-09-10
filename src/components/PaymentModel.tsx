import React, { useState } from 'react';
import { X, CreditCard, Lock, AlertCircle } from 'lucide-react';
import { Course } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  studentCategory: 'GEN' | 'SC' | 'ST' | 'EWS';
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  course,
  studentCategory,
  onPaymentSuccess
}) => {
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    city: '',
    zipCode: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  // Determine if payment is required based on category
  const isFree = ['SC', 'ST'].includes(studentCategory);
  const finalPrice = isFree ? 0 : course.price;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formatted.length <= 19) {
        setPaymentData(prev => ({ ...prev, [name]: formatted }));
      }
      return;
    }
    
    // Format expiry date
    if (name === 'expiryDate') {
      const formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      if (formatted.length <= 5) {
        setPaymentData(prev => ({ ...prev, [name]: formatted }));
      }
      return;
    }
    
    // Limit CVV to 3 digits
    if (name === 'cvv') {
      const formatted = value.replace(/\D/g, '');
      if (formatted.length <= 3) {
        setPaymentData(prev => ({ ...prev, [name]: formatted }));
      }
      return;
    }
    
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!isFree) {
      if (!paymentData.cardNumber || paymentData.cardNumber.replace(/\s/g, '').length !== 16) {
        newErrors.cardNumber = 'Please enter a valid 16-digit card number';
      }
      
      if (!paymentData.expiryDate || !/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
        newErrors.expiryDate = 'Please enter expiry date in MM/YY format';
      }
      
      if (!paymentData.cvv || paymentData.cvv.length !== 3) {
        newErrors.cvv = 'Please enter a valid 3-digit CVV';
      }
      
      if (!paymentData.cardholderName.trim()) {
        newErrors.cardholderName = 'Please enter cardholder name';
      }
      
      if (!paymentData.billingAddress.trim()) {
        newErrors.billingAddress = 'Please enter billing address';
      }
      
      if (!paymentData.city.trim()) {
        newErrors.city = 'Please enter city';
      }
      
      if (!paymentData.zipCode.trim()) {
        newErrors.zipCode = 'Please enter zip code';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, we'll assume payment is successful
      // In a real app, you would integrate with a payment processor like Stripe
      
      onPaymentSuccess();
      onClose();
    } catch (error) {
      console.error('Payment failed:', error);
      setErrors({ general: 'Payment failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {isFree ? 'Confirm Enrollment' : 'Payment Details'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Course Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">{course.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{course.institutionName}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Duration: {course.duration}</span>
              <div className="text-right">
                {isFree ? (
                  <div>
                    <span className="text-lg font-bold text-green-600">FREE</span>
                    <p className="text-xs text-green-600">({studentCategory} Category Benefit)</p>
                  </div>
                ) : (
                  <div>
                    <span className="text-lg font-bold text-blue-600">₹{finalPrice}</span>
                    <p className="text-xs text-gray-500">({studentCategory} Category)</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Category Information */}
          <div className={`rounded-lg p-4 mb-6 ${
            isFree ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-center space-x-2">
              <AlertCircle className={`h-5 w-5 ${isFree ? 'text-green-600' : 'text-blue-600'}`} />
              <p className={`text-sm ${isFree ? 'text-green-800' : 'text-blue-800'}`}>
                {isFree 
                  ? `As a ${studentCategory} category student, this course is completely free for you!`
                  : `As a ${studentCategory} category student, you need to pay the full course fee.`
                }
              </p>
            </div>
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isFree && (
              <>
                {/* Card Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="cardNumber"
                      value={paymentData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      className={`w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.cardNumber ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <CreditCard className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                  {errors.cardNumber && (
                    <p className="text-sm text-red-600 mt-1">{errors.cardNumber}</p>
                  )}
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date *
                    </label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={paymentData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.expiryDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.expiryDate && (
                      <p className="text-sm text-red-600 mt-1">{errors.expiryDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="cvv"
                        value={paymentData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.cvv ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      <Lock className="h-4 w-4 text-gray-400 absolute right-3 top-3" />
                    </div>
                    {errors.cvv && (
                      <p className="text-sm text-red-600 mt-1">{errors.cvv}</p>
                    )}
                  </div>
                </div>

                {/* Cardholder Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name *
                  </label>
                  <input
                    type="text"
                    name="cardholderName"
                    value={paymentData.cardholderName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.cardholderName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.cardholderName && (
                    <p className="text-sm text-red-600 mt-1">{errors.cardholderName}</p>
                  )}
                </div>

                {/* Billing Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Address *
                  </label>
                  <input
                    type="text"
                    name="billingAddress"
                    value={paymentData.billingAddress}
                    onChange={handleInputChange}
                    placeholder="123 Main Street"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.billingAddress ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.billingAddress && (
                    <p className="text-sm text-red-600 mt-1">{errors.billingAddress}</p>
                  )}
                </div>

                {/* City and Zip */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={paymentData.city}
                      onChange={handleInputChange}
                      placeholder="India"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.city ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.city && (
                      <p className="text-sm text-red-600 mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zip Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={paymentData.zipCode}
                      onChange={handleInputChange}
                      placeholder="10001"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.zipCode ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.zipCode && (
                      <p className="text-sm text-red-600 mt-1">{errors.zipCode}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                  isFree 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } disabled:opacity-50`}
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    {isFree ? (
                      <span>Enroll for Free</span>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        <span>Pay ₹{finalPrice}</span>
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </form>

          {!isFree && (
            <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-500">
              <Lock className="h-3 w-3" />
              <span>Your payment information is secure and encrypted</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;