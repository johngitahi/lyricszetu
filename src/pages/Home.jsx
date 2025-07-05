import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import SearchBar from "../components/SearchBar"

export default function Home() {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    supabase
      .from("songs")
      .select("id, title, slug, artist:artist_id(name)")
      .eq('status', 'approved')
      .limit(10)
      .then(({ data, error }) => {
        if (!error) setSongs(data);
      });
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-4">🎶 Welcome to Lyricszetu</h1>
      <p className="text-gray-600 mb-6">
        Explore annotated and translated lyrics. Built with ❤️ for music fans.
      </p>
      <SearchBar />
      <h2 className="text-2xl font-semibold mb-2 mt-6">Trending Songs</h2>
      <ul className="space-y-2">
        {songs.map((song) => (
          <li key={song.id}>
            <Link
              to={`/${song.slug}`}
              className="text-blue-600 hover:underline"
            >
              {song.title} — <span className="text-gray-600">{song.artist?.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}