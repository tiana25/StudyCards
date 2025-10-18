import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:3000"; //Backend url

export default function StudyPage() {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/cards/next`);
      if (!res.ok) throw new Error("Failed to fetch cards");
      const data = await res.json();
      setCards(data.cards || []);
      setCurrentIndex(0);
      setShowAnswer(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = () => {
    console.log("Review");
  };

  const currentCard = cards.length ? cards[currentIndex] : null;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <button
            onClick={fetchCards}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <span className="text-purple-300 text-sm font-medium">
            Card {currentIndex + 1} of {cards.length}
          </span>
          <div className="w-full bg-gray-700 h-1 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl p-12 shadow-2xl shadow-purple-500/30 border border-gray-700 min-h-[300px] flex flex-col items-center jsutify-center">
          <div className="text-center mb-8">
            <div className="text-white text-5xl font-bold mb-4">
              {currentCard ? currentCard.front : "No cards"}
            </div>

            {showAnswer && (
              <div className="mt-6 pt-6 border-t border-gray-600">
                <div className="text-purple-300 text-sm uppercase tracking-wide mb-2">
                  Translation
                </div>
                <div className="text-white text-4xl font-semibold">
                  {currentCard.back}
                </div>
              </div>
            )}
          </div>

          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              Show Answer
            </button>
          ) : (
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => handleReview(true)}
                disabled={submitting}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Remembered
              </button>
              <button
                onClick={() => {
                  handleReview(false);
                }}
                disabled={submitting}
                className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Forgot
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
