import React from "react";
import { Banknote, Clock3, QrCode } from "lucide-react";

const CheckoutForm = ({ formData, onChange }) => (
  <section className="checkout-form-section" aria-labelledby="pickup-heading">
    <div className="section-heading">
      <Clock3 size={20} />
      <div><h2 id="pickup-heading">Pickup details</h2><p>Pickup as soon as possible</p></div>
    </div>

    <div className="form-group">
      <label htmlFor="contact_name">Contact name *</label>
      <input id="contact_name" type="text" name="contact_name" maxLength={100} value={formData.contact_name} onChange={onChange} autoComplete="name" required />
    </div>
    <div className="form-group">
      <label htmlFor="phone_receiver">Phone number *</label>
      <input id="phone_receiver" type="tel" name="phone_receiver" maxLength={20} value={formData.phone_receiver} onChange={onChange} autoComplete="tel" required />
    </div>
    <div className="form-group">
      <label htmlFor="order_note">Order note <span>(optional)</span></label>
      <textarea id="order_note" name="note" maxLength={500} value={formData.note} onChange={onChange} placeholder="Allergies or preparation requests" />
      <small>{formData.note.length}/500</small>
    </div>

    <fieldset className="payment-fieldset">
      <legend>Payment method</legend>
      <div className="payment-methods">
        <label className={`method-card ${formData.payment_method === "cash" ? "active" : ""}`}>
          <input type="radio" name="payment_method" value="cash" checked={formData.payment_method === "cash"} onChange={onChange} />
          <Banknote /><span><strong>Cash</strong><small>Pay at pickup</small></span>
        </label>
        <label className={`method-card ${formData.payment_method === "payos" ? "active" : ""}`}>
          <input type="radio" name="payment_method" value="payos" checked={formData.payment_method === "payos"} onChange={onChange} />
          <QrCode /><span><strong>PayOS</strong><small>Pay online now</small></span>
        </label>
      </div>
    </fieldset>
  </section>
);

export default CheckoutForm;
