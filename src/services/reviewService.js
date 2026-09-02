import axios from "../utils/axios";
export const getPublicReviewsApi = (params = {}) => axios.get('/reviews', { params });
export const getReviewEligibilityApi = () => axios.get('/reviews/eligibility');
export const createReviewApi = (data) => axios.post('/reviews', data);
export const updateOwnReviewApi = (reviewId, data) => axios.put(`/reviews/${reviewId}`, data);
export const getManagedReviewsApi = (params = {}) => axios.get('/manage/reviews', { params });
export const updateReviewStatusApi = (reviewId, status) => axios.put(`/manage/reviews/${reviewId}/status`, { status });
