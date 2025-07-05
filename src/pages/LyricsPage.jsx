import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { Link } from "react-router-dom";

export default function LyricsPage() {
  const { slug } = useParams();
  const [song, setSong] = useState(null);
  const [lyrics, setLyrics] = useState([]);
  const [showTranslation, setShowTranslation] = useState(false);

  useEffect(() => {
    const fetchLyrics = async () => {
      // Fetch song by slug
      const { data: songData, error: songErr } = await supabase
        .from("songs")
        .select("*, artists(name)")
        .eq("slug", slug)
        .single();

      if (songErr) {
        console.error("Error fetching song:", songErr.message);
        return;
      }
      setSong(songData);

      // Fetch lyrics by song_id
      const { data: lyricsData, error: lyricsErr } = await supabase
        .from("lyrics")
        .select("*")
        .eq("song_id", songData.id)
        .order("line_number", { ascending: true });

      if (lyricsErr) {
        console.error("Error fetching lyrics:", lyricsErr.message);
        return;
      }
      setLyrics(lyricsData);
    };

    fetchLyrics();
  }, [slug]);

  if (!song) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{song.title}</h1>
      <Link to={`/artist/${song.artists.name.toLowerCase().replace(/\s+/g, '-')}`}>
        By {song.artists.name}
      </Link>

      {song.youtube_url && (
        <div className="mb-4">
          <iframe
            width="100%"
            height="315"
            src={`https://www.youtube.com/embed/${song.youtube_url}`}
            title={song.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
	  <button
	      onClick={() => setShowTranslation(!showTranslation)}
	      className="bg-gray-700 text-white px-3 py-1 rounded"
	  >
	      {showTranslation ? "Hide Translation" : "Show Translation"}
	  </button>

	  <Link to={`/lyric/edit/${song.id}`}>
	      <button className="bg-blue-600 text-white px-3 py-1 rounded">
		  Edit
	      </button>
	  </Link>
      </div>

      <div className="space-y-2">
        {lyrics.map((line, index) => (
          <div key={line.id} className="pb-2">
            <p className="text-lg">{line.content}</p>
            {showTranslation && line.translated_en && (
              <p className="text-sm text-gray-600 italic">{line.translated_en}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
