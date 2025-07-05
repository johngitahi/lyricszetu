import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { useNavigate, Link } from "react-router-dom";

export default function UserPage() {
  const [songs, setSongs] = useState([]);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Error getting user:", error);
        return;
      }

      setUser(user);

      if (user) {
        // Fetch user's profile to get role
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else {
          setRole(profile.role);
        }

        const { data: userSongs } = await supabase
          .from("songs")
          .select("*")
          .eq("user_id", user.id);

        setSongs(userSongs || []);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Your Profile</h2>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded mb-6">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>User ID:</strong> {user.id}</p>
        {["admin", "mod"].includes(role) && (
          <p className="mt-2">
            <Link to="/mods" className="text-blue-600 hover:underline">
              Go to Moderation Panel
            </Link>
          </p>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Submitted Songs</h3>
        {songs.length === 0 ? (
          <p className="text-gray-600">You haven’t submitted any songs yet.</p>
        ) : (
          <ul className="list-disc list-inside">
            {songs.map((song) => (
              <li key={song.id}>
                <a href={`/${song.slug}`} className="text-blue-600 hover:underline">
                  {song.title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}