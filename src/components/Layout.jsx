import Navbar from "./Navbar";

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-white text-black">
            <Navbar />
            <main className="max-w-3xl mx-auto p-4">{children}</main>
            <footer className="text-center text-gray-400 text-sm mt-12">
                &copy; {new Date().getFullYear()} Lyricszetu. All rights reserved.
            </footer>
        </div>
    )
}