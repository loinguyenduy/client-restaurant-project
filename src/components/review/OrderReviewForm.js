import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "react-toastify";
import { createReviewApi, updateOwnReviewApi } from "../../services/reviewService";
import "./OrderReviewForm.scss";

const ReviewStars = ({ value, size = 17 }) => (
  <span className="review-stars" aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Star key={star} size={size} fill={star <= value ? "currentColor" : "none"} />
    ))}
  </span>
);

const OrderReviewForm = ({ orderId, review = null, onSaved, onCancel }) => {
  const [rating, setRating] = useState(review?.rating || 5);
  const [comment, setComment] = useState(review?.comment || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setRating(review?.rating || 5);
    setComment(review?.comment || "");
    setError("");
  }, [orderId, review]);

  const submit = async (event) => {
    event.preventDefault();
    const normalizedComment = comment.trim();
    if (!normalizedComment) {
      setError("Please share a short comment about your experience.");
      return;
    }
    if (normalizedComment.length > 1000) {
      setError("Comment must be 1,000 characters or fewer.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const response = review
        ? await updateOwnReviewApi(review.id, { rating, comment: normalizedComment })
        : await createReviewApi({ order_id: orderId, rating, comment: normalizedComment });
      if (response?.EC !== 0) throw new Error(response?.EM || "Review could not be saved.");
      toast.success(review ? "Review updated." : "Thank you for your review.");
      await onSaved?.(response.DT);
    } catch (submitError) {
      const message = submitError?.EM || submitError?.message || "Review could not be saved.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="order-review-form" onSubmit={submit}>
      <fieldset disabled={busy}>
        <legend>Rate your order</legend>
        <div className="review-rating-input">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              type="button"
              key={value}
              className={value <= rating ? "selected" : ""}
              onClick={() => setRating(value)}
              aria-label={`${value} stars`}
              aria-pressed={value === rating}
            >
              <Star fill={value <= rating ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
      </fieldset>
      <label>
        Share your experience
        <textarea
          required
          maxLength="1000"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Tell us about the food and service..."
          disabled={busy}
        />
        <small>{comment.length}/1000</small>
      </label>
      {review?.status === "hidden" && <p className="review-moderation-note">This review is currently hidden by moderation. Editing it will not make it public.</p>}
      {error && <p className="review-form-error" role="alert">{error}</p>}
      <div className="review-form-actions">
        {onCancel && <button type="button" onClick={onCancel} disabled={busy}>Cancel</button>}
        <button type="submit" className="review-submit" disabled={busy}>{busy ? "Saving..." : review ? "Update Review" : "Submit Review"}</button>
      </div>
    </form>
  );
};

export { ReviewStars };
export default OrderReviewForm;
