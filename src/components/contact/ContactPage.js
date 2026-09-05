import React from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { restaurantInfo } from "../../content/restaurantInfo";
import "./ContactPage.scss";

const ContactPage = () => (
  <main className="contact-page">
    <section className="public-page-hero contact-hero">
      <span>Contact & location</span>
      <h1>We look forward to welcoming you</h1>
      <p>Find our location, opening hours and the best way to reach the Royal Restaurant team.</p>
    </section>
    <section className="contact-content public-content-shell">
      <div className="contact-heading">
        <span className="section-kicker">Visit Royal Restaurant</span>
        <h2>Everything you need to plan your visit</h2>
        <p>For table availability, use our reservation flow. For general questions, call or email us directly.</p>
        <Link to="/reservation" className="public-button gold">Reserve a Table</Link>
      </div>
      <div className="contact-details">
        <article><MapPin size={23} /><div><h3>Address</h3><p>{restaurantInfo.address}</p><a href={restaurantInfo.mapUrl} target="_blank" rel="noreferrer">Open in Maps</a></div></article>
        <article><Phone size={23} /><div><h3>Phone</h3><a href={`tel:${restaurantInfo.phoneHref}`}>{restaurantInfo.phoneDisplay}</a></div></article>
        <article><Mail size={23} /><div><h3>Email</h3><a href={`mailto:${restaurantInfo.email}`}>{restaurantInfo.email}</a></div></article>
        <article><Clock size={23} /><div><h3>Opening hours</h3>{restaurantInfo.openingHours.map((entry) => <p key={entry.days}><strong>{entry.days}</strong><span>{entry.hours}</span></p>)}</div></article>
      </div>
    </section>
  </main>
);

export default ContactPage;
