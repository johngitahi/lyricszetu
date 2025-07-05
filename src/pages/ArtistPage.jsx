import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';

export default function ArtistPage() {
  const { slug } = useParams();
  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtist = async () => {
      setLoading(true);

      const { data: artistData, error: artistError } = await supabase
        .from('artists')
        .select('*')
        .ilike('name', slug.replace(/-/g, ' ')); // approximate slug matching

      if (artistError || !artistData || artistData.length === 0) {
        setArtist(null);
        setLoading(false);
        return;
      }

      const artist = artistData[0];
      setArtist(artist);

      const { data: songsData, error: songsError } = await supabase
        .from('songs')
        .select('*')
        .eq('artist_id', artist.id)
        .order('created_at', { ascending: false });

      if (!songsError) {
        setSongs(songsData);
      }

      setLoading(false);
    };

    fetchArtist();
  }, [slug]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!artist) return <div className="p-4">Artist not found.</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        {artist.profile_image_url && (
          <img
            src={artist.profile_image_url}
            alt={artist.name}
            className="w-20 h-20 object-cover rounded-full"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold">{artist.name}</h1>
          {artist.bio && <p className="text-gray-600">{artist.bio}</p>}
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-2">Songs</h2>
      <ul className="space-y-2">
        {songs.map(song => (
          <li key={song.id}>
            <Link to={`/${song.slug}`} className="text-blue-600 hover:underline">
              {song.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
