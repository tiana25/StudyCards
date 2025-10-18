import React, { useState } from "react";

const API_BASE = "http://localhost:3000";

export default function UploadPage() {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleKeyPress = () => {
    console.log("Handle press");
  };

  const handleSubmit = async () => {
    if (!front.trim() || !back.trim()) {
      setMessage({ type: "error", text: "Both front and back are required!" });
      return;
    }
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ front: front.trim(), back: back.trim() }),
      });

      if (!res.ok) throw new Error("Failed to add card");

      setMessage({ type: "success", text: "Card added successfully!" });
      setFront("");
      setBack("");

      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: "error", text: `Error: ${err.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-white text-4xl font-bold mb-2">Add New Cards</h1>
        <p className="text-purple-300">Build your flashcard collection</p>
      </div>

      <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl shadow-purple-500/30 border border-gray-700">
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-900/50 text-green-200 border border-green-700"
                : "bg-red-900/50 text-red-200 border border-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div>
          <div className="mb-6">
            <label className="block text-purple-300 text-sm font-medium mb-2">
              Front (Question)
            </label>
            <input
              type="text"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="e.g., hund"
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              disabled={submitting}
            />
          </div>

          <div className="mb-6">
            <label className="block text-purple-300 text-sm font-medium mb-2">
              Back (Answer)
            </label>
            <input
              type="text"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="e.g., dog"
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              disabled={submitting}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-lg font-medium rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {submitting ? "Adding..." : "Add Card"}
          </button>
        </div>
      </div>
    </div>
  );
}
