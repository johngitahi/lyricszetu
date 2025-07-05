import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";

export default function EditSong() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [song, setSong] = useState(null);
  const [lyrics, setLyrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: songData, error: songError } = await supabase
          .from("songs")
          .select("*, artists(name)")
          .eq("id", id)
          .single();

        if (songError) throw songError;
        setSong(songData);

        const { data: lyricsData, error: lyricsError } = await supabase
          .from("lyrics")
          .select("*")
          .eq("song_id", id)
          .order("line_number", { ascending: true });

        if (lyricsError) throw lyricsError;
        setLyrics(lyricsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleLyricChange = (index, field, value) => {
    const updated = [...lyrics];
    updated[index][field] = value;
    setLyrics(updated);
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      for (let line of lyrics) {
        const { error } = await supabase
          .from("lyrics")
          .update({
            content: line.content,
            translated_en: line.translated_en,
          })
          .eq("id", line.id);

        if (error) throw error;
      }

      const { error: approveError } = await supabase
        .from("songs")
        .update({ status: "approved" })
        .eq("id", song.id);

      if (approveError) throw approveError;

      navigate("/mod");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!song) return <p className="p-4">Song not found.</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Edit Song Lyrics</h2>
      <div className="mb-4 bg-gray-100 p-4 rounded">
        <p><strong>Title:</strong> {song.title}</p>
        <p><strong>Artist:</strong> {song.artists?.name}</p>
      </div>

      {lyrics.map((line, index) => (
        <div key={line.id} className="flex gap-2 mb-2">
          <input
            type="text"
            value={line.content}
            onChange={(e) => handleLyricChange(index, "content", e.target.value)}
            className="w-1/2 p-2 border rounded"
            placeholder={`Line ${line.line_number}`}
          />
          <input
            type="text"
            value={line.translated_en}
            onChange={(e) => handleLyricChange(index, "translated_en", e.target.value)}
            className="w-1/2 p-2 border rounded"
            placeholder="English Translation"
          />
        </div>
      ))}

      <button
        onClick={handleApprove}
        disabled={loading}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
      >
        Approve & Save
      </button>
    </div>
  );
}