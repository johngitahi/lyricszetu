import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";

export default function EditArtist() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [artist, setArtist] = useState({ name: "", bio: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchArtist() {
      const { data, error } = await supabase
        .from("artists")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setArtist({
          name: data.name,
          bio: data.bio || "",
        });
      }
      setLoading(false);
    }

    fetchArtist();
  }, [slug]);

  const handleChange = (e) => {
    setArtist({ ...artist, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("artists")
      .update({
        name: artist.name,
        bio: artist.bio,
      })
      .eq("slug", slug);

    if (error) {
      setError(error.message);
    } else {
      navigate(`/artist/${slug}`);
    }
    setLoading(false);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl mb-4">Edit Artist</h2>

      <label className="block mb-2">Name</label>
      <input
        name="name"
        value={artist.name}
        onChange={handleChange}
        className="border p-2 w-full mb-4"
        required
      />

      <label className="block mb-2">Bio</label>
      <textarea
        name="bio"
        value={artist.bio}
        onChange={handleChange}
        rows={6}
        className="border p-2 w-full mb-4"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Update Artist
      </button>
    </form>
  );
}
