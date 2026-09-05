import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import './Footer.scss';
import { restaurantInfo } from '../../content/restaurantInfo';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section about">
          <h3 className="footer-title">ROYAL RESTAURANT</h3>
          <p className="footer-text">
            Thoughtful dishes, attentive service and a welcoming setting for meals worth sharing.
          </p>
          <nav className="footer-links" aria-label="Footer navigation"><Link to="/menu">Menu</Link><Link to="/reservation">Reservations</Link><Link to="/reviews">Reviews</Link></nav>
        </div>

        <div className="footer-section hours">
          <h3 className="footer-title">OPENING HOURS</h3>
          <ul>
            {restaurantInfo.openingHours.map((entry) => <li key={entry.days}><span>{entry.days}:</span> {entry.hours}</li>)}
          </ul>
        </div>

        <div className="footer-section contact">
          <h3 className="footer-title">CONTACT INFO</h3>
          <ul>
            <li><MapPin size={18} /><a href={restaurantInfo.mapUrl} target="_blank" rel="noreferrer">{restaurantInfo.address}</a></li>
            <li><Phone size={18} /><a href={`tel:${restaurantInfo.phoneHref}`}>{restaurantInfo.phoneDisplay}</a></li>
            <li><Mail size={18} /><a href={`mailto:${restaurantInfo.email}`}>{restaurantInfo.email}</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Royal Restaurant. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
