import React, { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

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

  const handleReview = async (remembered) => {
    if (submitting) return;

    const currentCard = cards[currentIndex];
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/cards/${currentCard.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remembered }),
      });

      if (!res.ok) throw new Error("Failed to submit review");

      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        setCurrentIndex(cards.length);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-white text-xl">Loading cards...</div>;
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="text-red-400 text-xl mb-4">{error}</div>
        <button
          onClick={fetchCards}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  //Completion state
  if (currentIndex >= cards.length) {
    return (
      <div className="text-center">
        <div className="text-6xl mb-6">Congrats!</div>
        <h2 className="text-white text-3xl font-bold mb-8">
          You're done for now!
        </h2>
        <button
          onClick={fetchCards}
          className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-purple-500/50"
        >
          Review Again
        </button>
      </div>
    );
  }

  const currentCard = cards.length ? cards[currentIndex] : null;

  return (
    <div className="w-full max-w-2xl">
      {/** Progress Indicator */}
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

      {/** Flashcard */}
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

      {/** Difficulty Indicator */}
      {currentCard.difficulty !== undefined && (
        <div className="text-center mt-4">
          <span className="text-gray-400 text-xs">
            Difficulty: {currentCard.difficulty.toFixed(1)}
          </span>
        </div>
      )}
    </div>
  );
}
