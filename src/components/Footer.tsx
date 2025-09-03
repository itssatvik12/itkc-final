import React from 'react';
import { Facebook, Twitter, Instagram } from 'lucide-react';
import logo from '../assets/image.png';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
                        
            <img src={logo} alt="ITKC Logo" className="h-12 w-30" />
              <div>
                <h3 className="text-xl font-bold">ITKC</h3>
                <p className="text-sm text-gray-400">Institute of Technical & Knowledge Center</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              Empowering learners worldwide with quality education and transformative learning experiences.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/itggoa" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://x.com/itg_goa?t=JKtoval2pk-04SmKhaTGOA&s=09" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://www.instagram.com/itg_goa/?igshid=YmMyMTA2M2Y%3D" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#courses" className="text-gray-400 hover:text-white transition-colors">Courses</a></li>
              <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#testimonials" className="text-gray-400 hover:text-white transition-colors">Testimonials</a></li>
              <li><a href="#faq" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-2 text-gray-400">
              <p>3rd Floor, IT Hub,Altinho</p>
              <p>Panaji - Goa</p>
              <p>Phone: <a href=" +91 (832) 2226024, +91 (832) 2225192" className="hover:text-white transition-colors">+91 (832) 2226024, +91 (832) 2225192</a></p>
              <p>Email: <a href="md-itg.goa@nic.in" className="hover:text-white transition-colors">info@itkc.edu</a></p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 ITKC - Institute of Technical & Knowledge Center. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;