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
              <StudyPage />
            </div>
          }
        />
        <Route path="/upload" element={<UploadPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
