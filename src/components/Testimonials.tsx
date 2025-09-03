import React from 'react';
import { Star, Quote } from 'lucide-react';
import image1 from '../assets/image 1.jpg';
import image2 from '../assets/image 2.png';
import image3 from '../assets/image 3.png';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      name: "Student",
      role: "Software Developer",
      image: image1,
      content: "I am, Student of IT knowledge centre Panaji of 2015, I had a great learning experience and Fully satisfied with the course training. The faculties were very supportive and motivated to learn new. Learning the courses at this institute helped me secure a job. And it will definitely help me in future career also. Thankyou.",
      rating: 5
    },
    {
      id: 2,
      name: "Manali Naik",
      role: "Data Scientist",
      image: image2,
      content: "Myself Manali Naik Student of It knowledge center sanguem batch 2012, Had a great learning experience and fully satisfied with my training and today this training helped me for my current job as I am a faculty in one of the computer Institute.",
      rating: 5
    },
    {
      id: 3,
      name: "Anjali Mehta",
      role: "UX Designer",
      image: image3,
      content: "I Have a great time doing this course I have gained alot of knowledge. I really enjoyed doing my course with Comtech Computer Academy you have helped in increasing my knowledge in computer. I could just like to say that this course have given me the confidence and skills that I needed in my life.",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">What Our Students Say</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hear from our successful graduates who transformed their careers with ITKC
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-gray-50 rounded-lg p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <Quote className="h-8 w-8 text-blue-600 mb-4" />
              
              <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
              
              <div className="flex items-center space-x-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;