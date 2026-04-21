import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter } from 'lucide-react';
import './Footer.scss';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section about">
          <h3 className="footer-title">ROYAL RESTAURANT</h3>
          <p className="footer-text">
            Experience the art of fine dining with exquisite flavors and a sophisticated atmosphere. 
            We bring you the best culinary traditions with a modern twist.
          </p>
          <div className="social-links">
            <a href="#"><Facebook size={20} /></a>
            <a href="#"><Instagram size={20} /></a>
            <a href="#"><Twitter size={20} /></a>
          </div>
        </div>

        <div className="footer-section hours">
          <h3 className="footer-title">OPENING HOURS</h3>
          <ul>
            <li><span>Monday - Friday:</span> 09:00 AM - 10:00 PM</li>
            <li><span>Saturday - Sunday:</span> 10:00 AM - 11:00 PM</li>
            <li className="note">Happy Hours: 05:00 PM - 07:00 PM</li>
          </ul>
        </div>

        <div className="footer-section contact">
          <h3 className="footer-title">CONTACT INFO</h3>
          <ul>
            <li><MapPin size={18} /> 123 Ho Tay Lake, Hanoi, Vietnam</li>
            <li><Phone size={18} /> +84 961998670</li>
            <li><Mail size={18} /> contact@royalrestaurant.com</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 Royal Restaurant. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;