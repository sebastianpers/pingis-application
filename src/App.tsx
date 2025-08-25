import "./App.css";

import "bootstrap/dist/css/bootstrap.min.css";

import NavbarComponent from "./components/NavbarComponent";
import HomePage from "./pages/HomePage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CreateMatchPage from "./pages/CreateMatchPage";
import StatisticPage from "./pages/StatisticPage";
import PlayersPage from "./pages/PlayersPage";
import ActiveMatchesPage from "./pages/ActiveMatchesPage";
import PlayedMatchesPage from "./pages/PlayedMatchesPage";
import SettingsPage from "./pages/SettingsPage";
import ActiveMatchPage from "./pages/ActiveMatchPage";
import PlayedMatchPage from "./pages/PlayedMatchPage";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <NavbarComponent />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create-match" element={<CreateMatchPage />} />
          <Route path="/statistics" element={<StatisticPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/active-match/:id" element={<ActiveMatchPage />} />
          <Route path="/active-matches" element={<ActiveMatchesPage />} />
          <Route path="/completed-matches" element={<PlayedMatchesPage />} />
          <Route path="/completed-matches/:id" element={<PlayedMatchPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
