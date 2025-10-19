import React, { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export default function UploadPage() {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [message, setMessage] = useState(null);
  const [bulkText, setBulkText] = useState("");

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

  const handleBulkUpload = async () => {
    if (!bulkText.trim()) {
      setMessage({ type: "error", text: "Please enter some cards!" });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const lines = bulkText.trim().split("\n");
      const cards = lines
        .map((line) => {
          const parts = line.split("|");
          if (parts.length !== 2) return null;
          const front = parts[0].trim();
          const back = parts[1].trim();
          return front && back ? { front, back } : null;
        })
        .filter(Boolean);

      if (cards.length === 0) {
        throw new Error("No valid cards found. Use format: front | back");
      }

      // Use bulk upload endpoint
      const res = await fetch(`${API_BASE}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards }),
      });

      if (!res.ok) throw new Error("Failed to upload cards");

      setMessage({
        type: "success",
        text: `Successfully added ${cards.length} cards!`,
      });
      setBulkText("");

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

      <div className="flex gap-2 mb-6 bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setBulkMode(false)}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            !bulkMode
              ? "bg-purple-600 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Single Card
        </button>
        <button
          onClick={() => setBulkMode(true)}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            bulkMode
              ? "bg-purple-600 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Bulk Upload
        </button>
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

        {!bulkMode ? (
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
        ) : (
          <div>
            <div className="mb-4">
              <label className="block text-purple-300 text-sm font-medium mb-2">
                Bulk Cards (one per line, format: front | back)
              </label>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="hund | dog&#10;katt | cat&#10;äpple | apple"
                rows="10"
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-mono text-sm"
                disabled={submitting}
              />
              <p className="text-gray-400 text-xs mt-2">
                Format:{" "}
                <code className="bg-gray-700 px-2 py-1 rounded">
                  front | back
                </code>{" "}
                (one card per line)
              </p>
            </div>

            <button
              onClick={handleBulkUpload}
              disabled={submitting}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-lg font-medium rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {submitting ? "Uploading..." : "Upload Cards"}
            </button>
          </div>
        )}
      </div>
      <div className="text-center mt-6">
        <a
          href="/"
          className="text-purple-300 hover:text-purple-200 transition-colors"
        >
          ← Back to Study
        </a>
      </div>
    </div>
  );
}
