import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { MessagesProvider } from "./contexts/MessagesContext";

function App() {
  return (
    <MessagesProvider>
      <Router>
        <Routes>
          <Route path="/*" element={<HomePage />} />
        </Routes>
      </Router>
    </MessagesProvider>
  );
}

export default App;
