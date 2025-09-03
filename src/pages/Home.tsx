import React from 'react';
import Hero from '../components/Hero';
import Courses from '../components/Courses';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import About from '../components/About';
import Contact from '../components/Contact';
import Feedback from '../components/Feedback';

const Home: React.FC = () => {
  return (
    <div>
      <Hero />
      <Courses />
      <Testimonials />
      <FAQ />
      <About />
      <Contact />
      <Feedback />
    </div>
  );
};

export default Home;