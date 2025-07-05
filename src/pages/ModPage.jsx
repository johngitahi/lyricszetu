import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { useNavigate } from "react-router-dom";

export default function ModPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [pendingSongs, setPendingSongs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getSessionAndProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/login");
        return;
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error || !profileData || !["admin", "mod"].includes(profileData.role)) {
        navigate("/");
        return;
      }

      setUser(session.user);
      setProfile(profileData);
    };

    getSessionAndProfile();
  }, [navigate]);

  useEffect(() => {
    const fetchPendingSongs = async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("id, title, slug, created_at, status, artist:artist_id(name)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (!error) {
        setPendingSongs(data);
      }
    };

    fetchPendingSongs();
  }, []);

  const goToEdit = (id) => {
    navigate(`/lyric/edit/${id}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded">
      <h1 className="text-2xl font-bold mb-4">Moderation Panel</h1>
      {pendingSongs.length === 0 ? (
        <p className="text-gray-600">No pending lyrics for review.</p>
      ) : (
        <ul className="space-y-4">
          {pendingSongs.map((song) => (
            <li key={song.id} className="border p-4 rounded shadow">
              <h2 className="text-lg font-semibold">
                {song.title} — {song.artist?.name}
              </h2>
              <p className="text-sm text-gray-500">
                Submitted on {new Date(song.created_at).toLocaleString()}
              </p>
              <div className="mt-2 flex gap-4 flex-wrap">
                <button
                  onClick={() => goToEdit(song.id)}
                  className="bg-blue-600 text-white px-4 py-1 rounded"
                >
                  Edit & Approve
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
