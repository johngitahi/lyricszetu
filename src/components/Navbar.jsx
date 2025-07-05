import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { supabase } from "../supabase/client";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const menuLinks = (
    <>
      <li>
        <Link to="/about" className="hover:text-gray-300">About</Link>
      </li>
      <li>
        <Link to="/support" className="hover:text-gray-300">Support Us</Link>
      </li>
      {user && (
        <li>
          <Link to="/submit" className="hover:text-gray-300">Submit Song</Link>
        </li>
      )}
      {user ? (
        <li>
          <Link to="/me" className="hover:text-gray-300">myPage</Link>
        </li>
      ) : (
        <li>
          <Link to="/login" className="hover:text-gray-300">Login</Link>
        </li>
      )}
    </>
  );  

  return (
    <header className="bg-black text-white shadow">
      <nav className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">Lyricszetu</Link>
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setOpen(!open)}
          aria-label="Toggle Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
        <ul className="hidden md:flex gap-6 font-medium">{menuLinks}</ul>
      </nav>

      {open && (
        <div className="md:hidden px-4 pb-3 space-y-2 bg-black">
          <ul className="space-y-2 font-medium">{menuLinks}</ul>
        </div>
      )}
    </header>
  );
}
