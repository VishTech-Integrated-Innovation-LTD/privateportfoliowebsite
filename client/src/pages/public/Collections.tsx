import { FiSearch } from "react-icons/fi"
import Footer from "../../components/Footer"
import Header from "../../components/Header"
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaFolder } from "react-icons/fa";
import Pagination from "../../components/Pagination";


// interface Collection {
//     id: string | number;
//     name: string;
//     description: string;
//     createdAt?: string;
// }

interface Collection {
    id: string | number;
    name: string;
    description: string;
    createdAt?: string;
    itemCount?: number; // Add this
    archives?: Array<{
        id: string;
        title: string;
        mediaType: string;
        cloudServiceUrl: string;
    }>;
}


const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;


const Collections = () => {

    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
        const [searchTerm, setSearchTerm] = useState("")
        const [filteredCollections, setFilteredCollections] = useState<Collection[]>([]);

            const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 12;

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/collections`);
                setCollections(res.data.collections || []);
            } catch (err) {
                console.error("Failed to load collections:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCollections();
    }, []);


// For Search
    useEffect(() => {
        const filtered = collections.filter(
            (i) =>
                i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                i.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCollections(filtered);
    }, [collections, searchTerm]);




const totalPages = Math.ceil(filteredCollections.length / itemsPerPage);
const paginatedCollections = filteredCollections.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);


    return (
        <section className="bg-[#F0F0F0]">

            {/* Header component */}
            <Header />
            <div className="min-h-screen py-12">
                <div className="container mx-auto px-6 max-w-8xl">

                    <div className="bg-linear-to-b from-[#0047AB] to-[#003380] text-white py-20 mb-12">
                        <div className="container mx-auto px-6 text-center">
                            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                                Collections
                            </h1>
                            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-90">
                                Curated groups of archive items telling meaningful stories
                            </p>

                            {/* Subtle gold accent line */}
                            <div className="w-32 h-1 bg-[#FFD700] mx-auto rounded-full"></div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="bg-white rounded-2xl shadow-md p-6 border border-[#dddbdb] mb-10">
                        <div className="relative max-w-md mx-auto">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0047AB]" size={22} />
                            <input
                                type="text"
                                placeholder="Search collections..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12  pr-6 py-4 text-lg border-2 border-[#d6d6d6] rounded-xl focus:outline-none focus:border-[#0047AB]"
                            />
                        </div>
                    </div>

                    {/* Collections Grid */}
                    {loading ? (
                        <p className="text-center text-2xl text-gray-600 py-20">Loading collections...</p>
                    ) : paginatedCollections.length === 0 ? (
                        <p className="text-center text-2xl text-gray-600 py-20">
                            {/* No collections available yet. */}
    {searchTerm ? `No collections found for "${searchTerm}"` : "No collections available yet."}
                            </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                            {paginatedCollections.map((collection) => (
                                <Link
                                    to={`/collections/${collection.id}`}
                                    key={collection.id}
                                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full"
                                >
                                    <div className="relative h-80 bg-linear-to-br from-[#0047AB]/20 to-[#FFD700]/20 flex items-center justify-center">

                                        <div className="h-48 flex items-center justify-center relative">
                                            <FaFolder size={60} className="text-[#0047AB]/70" />
                                        </div>

                                        {/* Item Count Badge */}
                                        <div className="absolute top-6 right-6 bg-[#0047AB] text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                                              {collection.itemCount || 0} item{Number(collection.itemCount) === 1 ? '' : 's'}
                                            {/* 0 items */}
                                            {/* {collection || 0} items */}
                                        </div>

                                        {/* Overlay on hover */}
                                        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-8">
                                            <span className="text-white text-2xl font-bold">View Collection &#8594;</span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-8 flex flex-col grow">
                                        <h2 className="text-2xl font-bold min-h-16 line-clamp-3 text-[#333333] mb-4 group-hover:text-[#0047AB] transition-colors">
                                            {collection.name}
                                        </h2>
                                        <p className="text-gray-600 grow text-lg leading-relaxed ">
                                            {collection.description}
                                        </p>
                                        <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100">
                                            <span className="text-sm text-gray-500">
                                                Created{" "}
                                                {collection.createdAt
                                                    ? new Date(collection.createdAt).toLocaleDateString("en-US", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })
                                                    : "Date unknown"}
                                            </span>
                                        </div>

                                    </div>

                                </Link>
                            ))}
                        </div>
                    )}

                    <Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>


                </div>
            </div>

            {/* Footer component */}
            <Footer />
        </section>
    )
}

export default Collections
