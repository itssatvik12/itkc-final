import React from 'react';
import { ArrowRight, BookOpen, Users, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Empower Your Future with
            <span className="block text-yellow-300">Quality Education</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Connect with top institutions, discover courses that match your goals, and advance your career with ITKC
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/signup"
              className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-300 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#courses"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-700 transition-colors"
            >
              Explore Courses
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Quality Courses</h3>
              <p className="text-blue-100">Learn from verified institutions with industry-relevant curriculum</p>
            </div>
            <div className="text-center">
              <Users className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Expert Instructors</h3>
              <p className="text-blue-100">Connect with experienced professionals and industry experts</p>
            </div>
            <div className="text-center">
              <Award className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Certified Learning</h3>
              <p className="text-blue-100">Earn recognized certificates to boost your career prospects</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;