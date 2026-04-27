import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Star, Clock, ChefHat } from 'lucide-react';
import './HomePage.scss';

const HomePage = () => {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-slogan">Elegant Dining Experience</h1>
          <p className="hero-sub">Where Every Flavor Tells a Story</p>
          <div className="hero-btns">
            <Link to="/menu" className="btn btn-gold">VIEW MENU</Link>
            <Link to="/reservation" className="btn btn-outline">BOOK A TABLE</Link>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="our-story section-padding">
        <div className="container">
          <div className="story-grid">
            <div className="story-image">
              <img src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800" alt="Our Chef" />
            </div>
            <div className="story-info">
              <h2 className="section-title">Our Story</h2>
              <p>Founded in 2010, Royal Restaurant has been a beacon of culinary excellence. Our mission is to provide an unforgettable dining experience through high-quality ingredients and exceptional service.</p>
              <p>Every dish we serve is a masterpiece, crafted with passion and precision by our world-class chefs.</p>
              <Link to="/about" className="link-gold">Read More About Us</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Dishes (Placeholders) */}
      <section className="featured-dishes section-padding bg-light">
        <div className="container text-center">
          <h2 className="section-title">Signature Dishes</h2>
          <div className="dish-grid">
            {[1, 2, 3].map((item) => (
              <div key={item} className="dish-card">
                <div className="dish-img"></div>
                <div className="dish-body">
                  <h3>Exquisite Main Dish {item}</h3>
                  <p>Fine ingredients blended with traditional techniques.</p>
                  <span className="price">$45.00</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-us section-padding">
        <div className="container">
          <h2 className="section-title text-center">Why Choose Us</h2>
          <div className="features-grid">
            <div className="feature-item">
              <ChefHat size={40} className="icon" />
              <h3>Professional Chefs</h3>
              <p>Our kitchen is led by award-winning culinary experts.</p>
            </div>
            <div className="feature-item">
              <Utensils size={40} className="icon" />
              <h3>Fresh Ingredients</h3>
              <p>We source only the finest and freshest local produce.</p>
            </div>
            <div className="feature-item">
              <Star size={40} className="icon" />
              <h3>Luxury Ambience</h3>
              <p>Enjoy your meal in a sophisticated and calm environment.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;