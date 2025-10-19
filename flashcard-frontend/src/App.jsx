import { BrowserRouter, Routes, Route } from "react-router-dom";
import StudyPage from "./StudyPage";
import UploadPage from "./UploadPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
              <a
                href="/upload"
                className="fixed top-6 right-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-purple-500/50 flex items-center gap-2"
              >
                <span className="text-xl">+</span> Add Cards
              </a>
              <StudyPage />
            </div>
          }
        />
        <Route
          path="/upload"
          element={
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
              <UploadPage />
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
