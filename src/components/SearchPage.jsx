import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase/client'; // adjust path as needed

export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            const { data: songs, error: songError } = await supabase
                .from('songs')
                .select('id, title, slug')
                .ilike('title', `%${query}%`);

            const { data: artists, error: artistError } = await supabase
                .from('artists')
                .select('id, name')
                .ilike('name', `%${query}%`);

            if (songError || artistError) {
                console.error(songError || artistError);
                setResults([]);
            } else {
                setResults([
                    { type: 'Songs', items: songs },
                    { type: 'Artists', items: artists },
                ]);
            }

            setLoading(false);
        };

        if (query.trim()) {
            fetchResults();
        } else {
            setResults([]);
            setLoading(false);
        }
    }, [query]);

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-4">Search Results for "{query}"</h1>
            {loading && <p>Loading...</p>}
            {!loading && results.every(r => r.items.length === 0) && <p>No results found.</p>}
            {results.map((section) => (
                section.items.length > 0 && (
                    <div key={section.type} className="mb-6">
                        <h2 className="text-lg font-semibold mb-2">{section.type}</h2>
                        <ul className="space-y-2">
                            {section.items.map((item) =>
                                section.type === 'Songs' ? (
                                    <li key={item.id}>
                                        <a href={`/${item.slug}`} className="text-blue-600 hover:underline">
                                            {item.title}
                                        </a>
                                    </li>
                                ) : (
                                    <li key={item.id}>
                                        <a href={`/artist/${item.name}`} className="text-blue-600 hover:underline">
                                            {item.name}
                                        </a>
                                    </li>
                                )
                            )}
                        </ul>
                    </div>
                )
            ))}
        </div>
    );
}
