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
import CreatePlayersPage from "./pages/CreatePlayersPage";
import PlayerPage from "./pages/PlayerPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InstallBanner from "./components/InstallBanner";

const App = () => {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <NavbarComponent />

        <InstallBanner />

        <ToastContainer
          position="top-center"
          autoClose={5000}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable={false}
          limit={3}
          theme="colored"
        />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create-players" element={<CreatePlayersPage />} />
          <Route path="/create-match" element={<CreateMatchPage />} />
          <Route path="/statistics" element={<StatisticPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/players/:id" element={<PlayerPage />} />
          <Route path="/active-match/:id" element={<ActiveMatchPage />} />
          <Route path="/active-matches" element={<ActiveMatchesPage />} />
          <Route path="/completed-matches" element={<PlayedMatchesPage />} />
          <Route path="/completed-matches/:id" element={<PlayedMatchPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
