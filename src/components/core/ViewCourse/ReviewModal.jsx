import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createRating } from "../../../services/operations/courseDetailsAPI";
import IconBtn from "../../common/IconBtn";

const Star = ({ filled, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`text-2xl ${filled ? "text-yellow-400" : "text-gray-300"}`}
    aria-label={filled ? "filled star" : "empty star"}
  >
    ★
  </button>
);

const ReviewModal = ({ isOpen, onClose, courseId, onSubmitted }) => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1) return;
    setSubmitting(true);
    const ok = await createRating({ courseId, rating, review }, token);
    setSubmitting(false);
    if (ok) {
      onClose?.();
      onSubmitted?.();
      setRating(0);
      setReview("");
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Add Review</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 px-5 py-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Your rating
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} filled={i <= rating} onClick={() => setRating(i)} />
              ))}
              <span className="ml-2 text-sm text-gray-600">{rating || 0}/5</span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Write a review (optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your thoughts about this course"
              className="h-28 w-full resize-none rounded-md border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <IconBtn
              type="submit"
              disabled={submitting || rating < 1}
              text={submitting ? "Submitting..." : "Submit Review"}
              customClasses="px-4"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
