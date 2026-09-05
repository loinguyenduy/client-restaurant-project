import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, HeartHandshake, Clock3 } from 'lucide-react';
import { getAllProducts } from '../../services/productService';
import { getSocket } from '../../services/socketService';
import formatCurrency from '../../utils/formatCurrency';
import ProductImage from '../menu/ProductImage';
import './HomePage.scss';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredState, setFeaturedState] = useState({ loading: true, error: '' });

  const loadFeaturedProducts = useCallback(async () => {
    setFeaturedState({ loading: true, error: '' });
    try {
      const response = await getAllProducts({ featured: true, page: 1, limit: 6 });
      if (response?.EC !== 0) throw new Error(response?.EM);
      setFeaturedProducts(response.DT?.products || []);
    } catch (error) {
      setFeaturedProducts([]);
      setFeaturedState({ loading: false, error: error?.EM || error?.message || 'Signature dishes could not be loaded.' });
      return;
    }
    setFeaturedState({ loading: false, error: '' });
  }, []);

  useEffect(() => { loadFeaturedProducts(); }, [loadFeaturedProducts]);

  useEffect(() => {
    const socket = getSocket();
    socket.on('product:availability_changed', loadFeaturedProducts);
    return () => socket.off('product:availability_changed', loadFeaturedProducts);
  }, [loadFeaturedProducts]);

  return (
    <div className="homepage">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-kicker">Welcome to Royal Restaurant</span>
          <h1 className="hero-slogan">A dining experience shaped around you</h1>
          <p className="hero-sub">Thoughtful dishes, warm service and time well spent together.</p>
          <div className="hero-btns">
            <Link to="/menu" className="btn btn-gold">View Menu</Link>
            <Link to="/reservation" className="btn btn-outline">Book a Table</Link>
          </div>
        </div>
        <div className="hero-visual" role="img" aria-label="The dining room at Royal Restaurant" />
      </section>

      <section className="our-story section-padding">
        <div className="container">
          <div className="story-grid">
            <div className="story-image">
              <img src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800" alt="A carefully prepared restaurant dish" />
            </div>
            <div className="story-info">
              <span className="section-kicker">Our approach</span>
              <h2 className="section-title">Food and hospitality, thoughtfully brought together</h2>
              <p>Royal Restaurant is a place for considered food, comfortable conversation and service that helps each occasion flow naturally.</p>
              <p>Whether you join us at a table or take a meal home, our team focuses on preparing every order with care.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="featured-dishes section-padding bg-light">
        <div className="container text-center">
          <span className="section-kicker">Selected from our menu</span>
          <h2 className="section-title">Signature Dishes</h2>
          {featuredState.loading ? <div className="featured-state"><span className="featured-loader" />Loading signature dishes...</div>
            : featuredState.error ? <div className="featured-state error"><p>{featuredState.error}</p><button type="button" onClick={loadFeaturedProducts}>Try again</button></div>
              : featuredProducts.length === 0 ? <div className="featured-state empty"><h3>No signature dishes selected yet</h3><p>Explore the full menu to discover what is currently available.</p><Link to="/menu" className="public-button gold">Browse the Menu</Link></div>
                : <div className="dish-grid">{featuredProducts.map((product) => {
                  const soldOut = !product.is_available || Number(product.stock_quantity) <= 0;
                  return <article key={product.id} className="dish-card">
                    <div className="dish-img"><ProductImage src={product.image_url} alt={product.name} />{soldOut && <span className="signature-stock">Sold Out</span>}</div>
                    <div className="dish-body"><span>{product.Category?.name || 'From our menu'}</span><h3>{product.name}</h3><p>{product.description || 'A thoughtfully prepared Royal Restaurant dish.'}</p><strong className="price">{formatCurrency(product.price)}</strong></div>
                  </article>;
                })}</div>}
          <Link to="/menu" className="signature-menu-link">View the complete menu</Link>
        </div>
      </section>

      <section className="why-us section-padding">
        <div className="container">
          <span className="section-kicker centered">Your time with us</span>
          <h2 className="section-title text-center">Made to feel effortless</h2>
          <div className="features-grid">
            <div className="feature-item">
              <Utensils size={36} className="icon" />
              <h3>Prepared to Order</h3>
              <p>Our kitchen coordinates each dish around your order and selected service.</p>
            </div>
            <div className="feature-item">
              <HeartHandshake size={36} className="icon" />
              <h3>Attentive Service</h3>
              <p>Clear, helpful service keeps the experience comfortable from arrival to farewell.</p>
            </div>
            <div className="feature-item">
              <Clock3 size={36} className="icon" />
              <h3>Time Well Spent</h3>
              <p>A calm setting designed for conversation, shared meals and special moments.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-cta"><div className="home-cta-content"><span>Plan your next meal</span><h2>Ready for your next meal?</h2><p>Reserve a table for dine-in or explore the menu for takeaway.</p><div className="home-cta-actions"><Link to="/reservation" className="public-button primary">Reserve a Table</Link><Link to="/menu" className="public-button secondary">Explore Menu</Link></div></div></section>
    </div>
  );
};

export default HomePage;
