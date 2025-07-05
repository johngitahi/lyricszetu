import { useState, useEffect } from "react";
import { supabase } from "../supabase/client";

export default function SubmitLyrics() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [artistId, setArtistId] = useState("");
  const [artists, setArtists] = useState([]);
  const [isCreatingArtist, setIsCreatingArtist] = useState(false);
  const [newArtistName, setNewArtistName] = useState("");
  const [editorText, setEditorText] = useState("");
  const [lyrics, setLyrics] = useState([]);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  useEffect(() => {
    const fetchArtists = async () => {
      const { data } = await supabase.from("artists").select("*").order("name");
      setArtists(data || []);
    };
    fetchArtists();
  }, []);

  const parseEditorText = (text) => {
    const lines = text.split("\n").map((line) => line.trim());
    const parsed = [];

    for (let i = 0; i < lines.length; i += 2) {
      const content = lines[i] || "";
      const translation = lines[i + 1] || "";
      parsed.push({ content, translation });
    }

    setHistory((prev) => [...prev, lyrics]);
    setRedoStack([]);
    setLyrics(parsed);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setRedoStack((r) => [lyrics, ...r]);
    setLyrics(prev);
    setEditorText(
      prev.map((l) => `${l.content}\n${l.translation}`).join("\n")
    );
    setHistory((h) => h.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistory((h) => [...h, lyrics]);
    setLyrics(next);
    setEditorText(next.map((l) => `${l.content}\n${l.translation}`).join("\n"));
    setRedoStack((r) => r.slice(1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isCreatingArtist && !newArtistName.trim()) {
      alert("Please enter a new artist name.");
      return;
    }
    if (!isCreatingArtist && !artistId) {
      alert("Please select an artist.");
      return;
    }

    let finalArtistId = artistId;

    if (isCreatingArtist && newArtistName.trim()) {
      const { data: newArtist, error: newArtistErr } = await supabase
        .from("artists")
        .insert([{ name: newArtistName.trim() }])
        .select()
        .single();

      if (newArtistErr) {
        alert("Error creating new artist: " + newArtistErr.message);
        return;
      }

      finalArtistId = newArtist.id;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("You must be logged in to submit lyrics.");
      return;
    }

    const { data: songData, error: songError } = await supabase
      .from("songs")
      .insert([
        {
          title,
          slug,
          youtube_url: youtubeUrl,
          artist_id: finalArtistId,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (songError) {
      alert("Error creating song: " + songError.message);
      return;
    }

    for (let i = 0; i < lyrics.length; i++) {
      const line = lyrics[i];
      const { error: lyricError } = await supabase.from("lyrics").insert([
        {
          song_id: songData.id,
          line_number: i + 1,
          content: line.content,
          translated_en: line.translation,
        },
      ]);

      if (lyricError) {
        console.error("Error inserting lyric line:", lyricError);
      }
    }

    alert("Song and lyrics submitted!");

    setTitle("");
    setSlug("");
    setYoutubeUrl("");
    setArtistId("");
    setIsCreatingArtist(false);
    setNewArtistName("");
    setEditorText("");
    setLyrics([]);
    setHistory([]);
    setRedoStack([]);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-3xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">Submit Song Lyrics</h2>

      <input
        type="text"
        placeholder="Song Title"
        value={title}
        onChange={(e) => {
          const t = e.target.value;
          setTitle(t);
          if (artistId) {
            const artistName =
              artists.find((a) => a.id === artistId)?.name || "";
            setSlug(
              `${artistName}-${t}`.toLowerCase().replace(/\s+/g, "-") + "-lyrics"
            );
          }
        }}
        className="w-full p-2 border rounded"
        required
      />

      <input
        type="text"
        placeholder="Slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      <input
        type="text"
        placeholder="YouTube URL"
        value={youtubeUrl}
        onChange={(e) => setYoutubeUrl(e.target.value)}
        className="w-full p-2 border rounded"
      />

      <select
        value={artistId || ""}
        onChange={(e) => {
          if (e.target.value === "create") {
            setIsCreatingArtist(true);
            setArtistId("");
            setNewArtistName("");
          } else {
            setIsCreatingArtist(false);
            setArtistId(e.target.value);
            const selected = artists.find((a) => a.id === e.target.value);
            if (selected && title) {
              setSlug(
                `${selected.name}-${title}`
                  .toLowerCase()
                  .replace(/\s+/g, "-") + "-lyrics"
              );
            }
          }
        }}
        className="w-full p-2 border rounded"
        required={!isCreatingArtist}
      >
        <option value="">Select Artist</option>
        {artists.map((artist) => (
          <option key={artist.id} value={artist.id}>
            {artist.name}
          </option>
        ))}
        <option value="create">+ Create new artist</option>
      </select>

      {isCreatingArtist && (
        <input
          type="text"
          placeholder="New Artist Name"
          value={newArtistName}
          onChange={(e) => {
            setNewArtistName(e.target.value);
            if (title) {
              setSlug(
                `${e.target.value}-${title}`
                  .toLowerCase()
                  .replace(/\s+/g, "-") + "-lyrics"
              );
            }
          }}
          className="w-full p-2 border rounded"
          required
        />
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Lyrics Editor</h3>
        <textarea
          placeholder="Enter lyrics and translations like:
line 1
translation 1
line 2
translation 2"
          value={editorText}
          onChange={(e) => {
            setEditorText(e.target.value);
            parseEditorText(e.target.value);
          }}
          className="w-full h-64 p-2 border rounded font-mono"
        ></textarea>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleUndo}
            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={handleRedo}
            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
          >
            Redo
          </button>
        </div>
      </div>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Submit
      </button>
    </form>
  );
}
