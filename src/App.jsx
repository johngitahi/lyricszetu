import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LyricsPage from "./pages/LyricsPage";
import Layout from "./components/Layout";
import SubmitSong from "./pages/SubmitSong";
import ArtistPage from "./pages/ArtistPage";
import SearchPage from "./components/SearchPage";
import ProtectedRoute from "./components/RouterComponent";
import Login from "./pages/Login";
import UserPage from "./pages/UserPage";
import About from "./pages/About";
import Support from "./pages/Support";
import EditArtist from "./pages/EditArtist";
import EditLyric from "./pages/EditLyric";
import Signup from "./pages/Signup";
import ModPage from "./pages/ModPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/:slug"
          element={
            <Layout>
              <LyricsPage />
            </Layout>
          }
        />
        <Route
          path="/submit"
          element={
            <Layout>
              <ProtectedRoute>
                <SubmitSong />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/artist/:slug"
          element={
            <Layout>
              <ArtistPage />
            </Layout>
          }
        />
        <Route
          path="/search"
          element={
            <Layout>
              <SearchPage />
            </Layout>
          }
        />
        <Route
        path="/login"
        element={
          <Layout>
            <Login />
          </Layout>
        }
        />
        <Route
          path="/me"
          element={
            <Layout>
              <ProtectedRoute>
                <UserPage />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/about"
          element={
            <Layout>
              <About />
            </Layout>
          }
        />
        <Route
          path="/support"
          element={
            <Layout>
              <Support />
            </Layout>
          }
        />
        <Route
          path="/lyric/edit/:id"
          element={
	    <Layout>
		<ProtectedRoute>
		    <EditLyric />
		</Protectedroute>
            </Layout>
          }
        />
        <Route
          path="/artist/edit/:slug"
          element={
	    <Layout>
		<ProtectedRoute>
		    <EditArtist />
		</ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/signup"
          element={
            <Layout>
              <Signup />
            </Layout>
          }
        />
        <Route
          path="/mods"
          element={
            <Layout>
              <ProtectedRoute>
                <ModPage />
              </ProtectedRoute>
            </Layout>
          }
        />
      </Routes>
    </Router>
  )
}
