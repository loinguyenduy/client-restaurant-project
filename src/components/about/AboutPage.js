import React from "react";
import { Link } from "react-router-dom";
import { HeartHandshake, Sparkles, Utensils } from "lucide-react";
import "./AboutPage.scss";

const AboutPage = () => (
  <main className="about-page">
    <section className="public-page-hero">
      <span>Our approach</span>
      <h1>Dining with care in every detail</h1>
      <p>Royal Restaurant brings thoughtful food, attentive service and a welcoming setting together for everyday meals and special occasions.</p>
    </section>

    <section className="about-introduction public-content-shell">
      <div className="about-image" role="img" aria-label="A warmly lit restaurant dining room" />
      <div>
        <span className="section-kicker">Royal Restaurant</span>
        <h2>A composed, comfortable dining experience</h2>
        <p>Our menu is designed around balanced flavors and dishes prepared to order. From a quick takeaway to a table shared with friends, we aim to make each visit feel considered and easy.</p>
        <p>Our team focuses on clear service, careful preparation and a calm atmosphere—simple principles that help every guest feel looked after.</p>
      </div>
    </section>

    <section className="about-values public-content-shell" aria-labelledby="about-values-title">
      <div className="public-section-heading">
        <span className="section-kicker">What matters to us</span>
        <h2 id="about-values-title">Hospitality without unnecessary ceremony</h2>
      </div>
      <div className="about-value-grid">
        <article><Utensils size={28} /><h3>Prepared with attention</h3><p>Each order is handled with practical care from the kitchen through service.</p></article>
        <article><HeartHandshake size={28} /><h3>Warm, clear service</h3><p>We value helpful communication and a comfortable pace for every guest.</p></article>
        <article><Sparkles size={28} /><h3>Moments worth sharing</h3><p>Our space is shaped for relaxed meals, celebrations and conversation.</p></article>
      </div>
    </section>

    <section className="public-cta">
      <div><span>Plan your visit</span><h2>Discover your next Royal Restaurant favorite.</h2></div>
      <div><Link to="/menu" className="public-button gold">Explore the Menu</Link><Link to="/reservation" className="public-button outline">Reserve a Table</Link></div>
    </section>
  </main>
);

export default AboutPage;
