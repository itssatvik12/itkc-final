import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const faqs = [
    {
      id: 1,
      question: 'HOW DO I SIGN UP?',
      answer:  'If you already have an account, you can login with your email and password. If you do not already have an account, you can create one by filling out the form in the "Register" section.'
    },
    {
      id: 2,
      question: 'WHAT ARE THE DOCUMENTS REQUIRED TO BE UPLOADED WITH ONLINE APPLICATION?',
      answer: `<div class="space-y-2"><div><strong>For General Applicant:</strong><ul class="list-decimal list-inside ml-4"><li>Passport Size Photo</li></ul></div><div><strong>For TSP Applicant:</strong><ul class="list-decimal list-inside ml-4"><li>Passport Size Photo</li><li>Aadhaar Card</li><li>Caste certificate</li><li>Birth certificate</li></ul></div></div>`
    },
    {
      id: 3,
      question: 'WHAT TO DO IF I FORGOT MY PASSWORD?',
      answer: 'If you forget your password, you can reset it by clicking on the "forgot password" button. You will receive an email at your registered email address and an SMS on your registered mobile number to reset your password.'
    },
    {
      id: 4,
      question: 'HOW TO CHECK MY APPLICATION STATUS?',
      answer: 'You can track the status of your application by logging in to the portal. You will see the current status of the application on the user portal in \'My Applications\' section.'
    },
    {
      id: 5,
      question: 'CAN I APPLY FOR MULTIPLE APPLICATIONS?',
      answer: 'Yes, you can apply for multiple applications.'
    },
    {
      id: 6,
      question: 'Do I need to pay any fees?',
      answer: 'Fees are exempted for TSP applicants, applicants belonging to general category need to pay for the courses they choose.'
    }
  ];

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our platform and courses
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq) => (
            <div key={faq.id} className="mb-4">
              <button
                onClick={() => toggleItem(faq.id)}
                className="w-full bg-white rounded-lg p-6 text-left hover:shadow-md transition-shadow flex items-center justify-between"
              >
                <h3 className="text-lg font-semibold text-gray-800">{faq.question}</h3>
                {openItems.includes(faq.id) ? (
                  <ChevronUp className="h-5 w-5 text-blue-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-blue-600" />
                )}
              </button>
              
              {openItems.includes(faq.id) && (
                <div className="bg-white px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;