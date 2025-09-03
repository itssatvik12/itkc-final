import React from 'react';
import { Target, Eye, Users, Award, Check } from 'lucide-react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">About ITKC</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The Institute of Technical and Knowledge Center is dedicated to bridging the gap between 
            learners and quality education through our innovative online platform.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Our Story</h3>
            <p className="text-gray-600 mb-4">
To empower individuals and communities throughout enhanced access to information, education and communication facilities. The centers provide job oriented IT training to the local youth.
            </p>
            <p className="text-gray-600 mb-4">
IT training shall be imparted in two categories
            </p>
            <div className="text-gray-600">
              
              <p className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <p className="mb-2">General students.</p>
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="mb-2">Free training to SC/ST students under the scheme</p>
              </p>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://itkc.goa.gov.in/assets/Student/img/logo.png"
              alt="Students learning online"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">Our Mission</h4>
            <p className="text-gray-600">
              To democratize access to quality education and empower learners to achieve their goals.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Eye className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">Our Vision</h4>
            <p className="text-gray-600">
              To be the world's leading platform for connecting learners with transformative education.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">Community</h4>
            <p className="text-gray-600">
              Building a global community of learners, educators, and institutions working together.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">Excellence</h4>
            <p className="text-gray-600">
              Maintaining the highest standards in course quality and educational outcomes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;