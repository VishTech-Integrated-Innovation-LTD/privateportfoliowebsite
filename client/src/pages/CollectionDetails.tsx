import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FiArrowLeft, FiEdit2, FiPlus, FiSearch } from "react-icons/fi";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { FaBox, FaCalendar, FaFileAlt, FaFolder, FaVideo } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface ArchiveItem {
  id: string | number;
  title: string;
  description?: string;
  mediaType: "image" | "video" | "document";
  cloudServiceUrl: string;
  isOnTheMainPage: boolean
  createdAt: string;
  fileSize?: number; // Optional: if you store size in DB
}

interface CollectionData {
  id: string | number;
  name: string;
  description: string;
  createdAt: string;
  items: ArchiveItem[];
}



const CollectionDetails = () => {

  const { id } = useParams<{ id: string }>();
  const [collection, setCollection] = useState<CollectionData | null>(null)
  const [filteredItems, setFilteredItems] = useState<ArchiveItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);


    // !! is a common JavaScript trick to convert truthy/falsy values into true or false.
  // If a token exists; isAdmin = true
  // Simple admin check 
  const isAdmin = !!localStorage.getItem("token");


  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/collections/${id}`);
        const data = res.data.collection || res.data;
        setCollection(data);
        setFilteredItems(data.items || []);
      } catch (error) {
        console.error("Failed to load collection:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [id]);


  // For Search
    useEffect(() => {
    if (!collection?.items) return;
        const filtered = collection.items.filter(
            (i) =>
                i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                i.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredItems(filtered);
    }, [collection, searchTerm]);


  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });


  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center">
        <p className="text-2xl text-gray-600">Loading collection...</p>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center">
        <p className="text-2xl text-red-600">Collection not found.</p>
      </div>
    );
  }

  


  return (
    <section className="bg-[#F0F0F0] min-h-screen">

      {/* Header component */}
      <Header />

      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Back Link */}
        <Link
          to={isAdmin ? "/admin/dashboard" : "/collections"}
          className="text-[#0047AB] inline-flex items-center gap-2 hover:underline font-medium text-lg"
        >
          <FiArrowLeft size={20} />
          Back to Collections
        </Link>

        <div className="flex flex-col items-center bg-linear-to-b from-[#0047AB] to-[#003366] text-white gap-8 py-20 px-6 rounded-b-3xl shadow-2xl mt-4">
          <div className="w-48 h-48 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
            {/* <div className="w-48 h-48 bg-white/25 rounded-full flex items-center justify-center mt-6"> */}
            <FaFolder size={100} className="text-white/80 drop-shadow-lg" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">{collection?.name}</h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto opacity-90">
            {collection?.description}
          </p>

          <div className="flex flex-wrap gap-10 justify-center text-white/90 mt-6">
            <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
              <span className="text-[#FFD700] text-xl">
                <FaBox size={20} />
              </span>
              <span className="font-semibold">
                {collection?.items?.length || 0} item{collection?.items?.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
              <span className="text-[#FFD700] text-xl">
                <FaCalendar size={20} />
              </span>
              <span className="font-semibold">
                Created {formatDate(collection?.createdAt)}
              </span>
            </div>

            {/* Admin-only controls */}
{isAdmin && (
   <div className="flex items-center justify-center gap-6 mt-4">
                  <Link
                    to={`/collections/edit/${collection.id}`}
                    className="flex items-center gap-3 px-8 py-4 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all shadow-lg font-medium text-lg"
                  >
                    <FiEdit2 size={25} />
                    Edit Collection
                  </Link>
  
                  <Link
                    to="/archive-items/upload"
                    className="flex items-center gap-3 px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg font-medium text-lg"
                  >
                    <FiPlus size={30} />
                    Add New Item
                  </Link>
                </div>
)}

          </div>
        </div>


        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="relative mt-6">
            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-[#0047AB]" size={24} />
            <input
              type="text"
              placeholder="Search in this collection..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-5 text-lg bg-white border-2 border-[#0047AB]/20 rounded-full focus:outline-none focus:border-[#0047AB] focus:ring-2 focus:ring-[#FFD700]/50 shadow-lg transition-all"
            />
          </div>
        </div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-600">
              {searchTerm ? `No items found for "${searchTerm}"` : "This collection has no items yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredItems.map((item) => (
              <Link
                to={`/archive-items/${item.id}`}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <div className="relative h-64 bg-linear-to-br from-[#0047AB]/10 to-[#FFD700]/10 overflow-hidden">
                  {item.mediaType === "image" ? (
                    <img
                      src={item.cloudServiceUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-6xl text-[#0047AB]/70">
                      {item.mediaType === "video" ? <FaVideo /> : <FaFileAlt />}
                    </div>
                  )}

                  {item.isOnTheMainPage && (
                    <span className="absolute top-4 right-4 bg-[#FFD700] text-[#333333] px-3 py-1 rounded-full text-sm font-bold shadow-md">
                      Featured
                    </span>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-xl text-[#333333] mb-3 line-clamp-2 group-hover:text-[#0047AB] transition-colors">
                    {item.title}
                  </h3>

                  <div className="text-sm text-gray-600 space-y-2">
                    <p className="font-medium capitalize">{item.mediaType}</p>
                    <p>{formatDate(item.createdAt)}</p>
                  </div>
                </div>

              </Link>
            ))}

          </div>
        )}


      </div>

      {/* Footer component */}
      <Footer />

    </section>
  )
}

export default CollectionDetails