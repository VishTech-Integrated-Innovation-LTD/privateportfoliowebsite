import { useState } from "react"
import { FiArchive, FiFolder, FiHome, FiLogOut, FiMenu, FiUser, FiX } from "react-icons/fi"
import { Link, useNavigate } from "react-router-dom"

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const isAuthenticated = !!token;

    const handleLogout = () => {
        localStorage.removeItem('token');
        // navigate('/auth/login');
        navigate('/');
        setIsMenuOpen(false);
    };


    // WhatsApp link
    // const whatsappLink = "https://wa.me/2347040789324?text=Hello%20Folasade,%20I'd%20like%20to%20talk%20to%20you...";
    // const whatsappLink = " https://wa.link/g1rtam";

    return (
        <header className="sticky top-0 z-50 text-white bg-[#0047AB] font-[Roboto] min-h-[10vh] p-1 shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">

                    {/* Logo */}
                    <Link to='/'>
                        <div className="rounded-b-3xl w-14 h-14 shadow-2xl flex justify-center items-center border-4 border-white/25">
                            <span className="text-3xl font-bold text-[#f0f0f0]">FA</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex gap-6">
                        <Link
                            to="/"
                            className="flex items-center gap-2 hover:text-[#FFD700] transition-colors hover:border-b-2"
                        >
                            <FiHome size={18} />
                            <span>Home</span>
                        </Link>

                        <Link
                            to="/archive-items"
                            className="flex items-center gap-2 hover:text-[#FFD700] transition-colors hover:border-b-2"
                        >
                            <FiArchive size={18} />
                            <span>Archives</span>
                        </Link>

                        <Link
                            to="/collections"
                            className="flex items-center gap-2 hover:text-[#FFD700] transition-colors hover:border-b-2"
                        >
                            <FiFolder size={18} />
                            <span>Collections</span>
                        </Link>

                        {/* Auth Section */}
                        {isAuthenticated && (
                            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/20">
                                <Link
                                    to='/admin/dashboard'
                                    className="text-[#FFD700] font-medium flex gap-2 items-center"
                                >
                                    <FiUser size={18} />
                                    <span>Admin</span>
                                </Link>
                                {/* Logout button */}
                                <button
                                    onClick={handleLogout}
                                    className="bg-[#DC3545] hover:bg-red-600 text-white px-4 py-2 rounded transition-colors flex items-center gap-2 cursor-pointer"
                                >
                                    <FiLogOut size={18} />
                                    <span>Logout</span>
                                </button>
                            </div>

                        )
                            //             : (
                            //                 <a
                            //                     href={whatsappLink}
                            //                     target="_blank"
                            //                     rel="noopener noreferrer"
                            //                     className="bg-amber-400 hover:bg-amber-500 text-white font-medium px-6 py-2 rounded-full ml-4 
                            //  transition-all duration-300 ease-in-out
                            //  hover:scale-105 hover:shadow-lg hover:shadow-amber-500/40
                            //  animate-bounce-slow flex items-center gap-2"
                            //                 >
                            //                     <span>Talk to me</span>
                            //                     <FiMessageSquare size={20} />
                            //                 </a>
                            //             )
                        }

                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden"
                    >
                        {isMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
                    </button>

                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-white/20">
                        <nav className="flex flex-col gap-4">
                            <Link
                                to="/"
                                className="flex items-center gap-3 hover:text-[#FFD700] transition-colors py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <FiHome size={20} />
                                <span>Home</span>
                            </Link>


                            <Link
                                to="/archive-items"
                                className="flex items-center gap-3 hover:text-[#FFD700] transition-colors py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <FiArchive size={20} />
                                <span>Archives</span>
                            </Link>

                            <Link
                                to="/collections"
                                className="flex items-center gap-3 hover:text-[#FFD700] transition-colors py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <FiFolder size={20} />
                                <span>Collections</span>
                            </Link>


                            {/* Auth Section */}
                            {isAuthenticated && (
                                <>
                                    <Link
                                        to="/admin/dashboard"
                                        className="text-[#FFD700] font-medium flex items-center gap-3 py-2 border-t border-white/20 pt-4 mt-2"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <FiUser size={20} />
                                        <span>Admin Dashboard</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-[#DC3545] hover:bg-red-600 text-white px-4 py-3 rounded transition-colors flex items-center gap-3 justify-center"
                                    >
                                        <FiLogOut size={20} />
                                        <span>Logout</span>
                                    </button>
                                </>
                            )
                                //                 : (
                                //                     <a
                                //                         href={whatsappLink}
                                //                         target="_blank"
                                //                         rel="noopener noreferrer"
                                //                         className="bg-amber-400 hover:bg-amber-500 text-white font-medium px-6 py-3 rounded-full ml-4 
                                //  transition-all duration-300 ease-in-out
                                //  hover:scale-105 hover:shadow-xl hover:shadow-amber-500/50
                                //  animate-bounce-slow flex items-center justify-center gap-2"
                                //                     >
                                //                         <span>Talk to me</span>
                                //                         <FiMessageSquare size={20} />
                                //                     </a>
                                //                 )
                            }

                        </nav>
                    </div>
                )}
            </div>
            <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3.5s infinite ease-in-out;
        }
      `}</style>
        </header>
    )
}

export default Header