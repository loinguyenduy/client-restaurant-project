import React, { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { getPublicReviewsApi } from "../../services/reviewService";
import { formatDateTime } from "../../utils/orderDisplay";
import { ReviewStars } from "./OrderReviewForm";
import "./ReviewsPage.scss";

const ReviewsPage = () => {
  const [data, setData] = useState({ reviews: [], summary: { average_rating: 0, total_reviews: 0, rating_distribution: {} }, page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [filterRating, setFilterRating] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPublic = useCallback(async () => {
    setLoading(true); setError("");
    try { const response = await getPublicReviewsApi({ page, limit: 10, rating: filterRating }); if (response?.EC !== 0) throw new Error(response?.EM); setData(response.DT); }
    catch (loadError) { setError(loadError?.EM || loadError?.message || "Reviews could not be loaded."); }
    finally { setLoading(false); }
  }, [filterRating, page]);
  useEffect(() => { loadPublic(); }, [loadPublic]);

  return <main className="reviews-page"><header><span>Verified restaurant experiences</span><h1>Guest Reviews</h1><p>Browse feedback from completed Royal Restaurant orders.</p></header>
    <section className="review-summary"><div><strong>{Number(data.summary.average_rating || 0).toFixed(1)}</strong><ReviewStars value={Math.round(data.summary.average_rating || 0)} size={16} /><span>{data.summary.total_reviews} reviews</span></div><div>{[5,4,3,2,1].map((value) => { const count = data.summary.rating_distribution?.[value] || 0; const percent = data.summary.total_reviews ? count / data.summary.total_reviews * 100 : 0; return <div key={value}><span>{value}★</span><i><b style={{ width: `${percent}%` }} /></i><small>{count}</small></div>; })}</div></section>
    <section className="review-list-section"><div className="review-list-heading"><h2>Recent reviews</h2><select value={filterRating} onChange={(event) => { setFilterRating(event.target.value); setPage(1); }}><option value="all">All ratings</option>{[5,4,3,2,1].map((value) => <option value={value} key={value}>{value} stars</option>)}</select></div>{loading ? <div className="review-state">Loading reviews...</div> : error ? <div className="review-state error"><p>{error}</p><button onClick={loadPublic}><RefreshCw size={15} /> Retry</button></div> : data.reviews.length === 0 ? <div className="review-state">No public reviews match this filter.</div> : <div className="review-list">{data.reviews.map((review) => <article key={review.id}><div><strong>{review.User?.full_name || "Royal Restaurant guest"}</strong><ReviewStars value={review.rating} size={16} /></div><p>{review.comment}</p><small>{formatDateTime(review.createdAt)}</small></article>)}</div>}<footer><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {data.page || page} of {Math.max(data.totalPages || 1,1)}</span><button disabled={page >= (data.totalPages || 1)} onClick={() => setPage((value) => value + 1)}>Next</button></footer></section>
  </main>;
};
export default ReviewsPage;
