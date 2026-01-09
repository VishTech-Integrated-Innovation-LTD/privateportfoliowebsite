/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FiFilter, FiSearch } from "react-icons/fi";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaFileAlt, FaVideo } from "react-icons/fa";

interface Category {
  id: string
  name: string
}


interface ArchiveItem {
  id: string | number;
  title: string;
  description: string;
  mediaType: "image" | "video" | "document";
  cloudServiceUrl: string;
  createdAt: string;
  isOnTheMainPage?: boolean;
  category?: string;
}



const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;



const Archives = () => {



  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  

  // ---------------------------------->>>
  // Fetch categories and items on mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);

        // Fetch categories
        const catRes = await axios.get(`${API_BASE_URL}/categories`);
        setCategories(catRes.data || []);

        // Fetch public archive items
        const itemRes = await axios.get(`${API_BASE_URL}/archive-items`);
        const publicItems = (itemRes.data || []).filter((item: any) => item.visibility === "public");
        setItems(publicItems);
        setFilteredItems(publicItems);
      } catch (err) {
        console.error("Failed to load categories or archive items:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // ---------------------------------->>>

  // For Search
  // useEffect(() => {
  //   const filtered = items.filter(
  //     (i) =>
  //       i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       i.description.toLowerCase().includes(searchTerm.toLowerCase())
  //   );
  //   setFilteredItems(filtered);
  // }, [items, searchTerm]);


// Refetch items when search or category changes
  useEffect(() => {
    const fetchFilteredItems = async () => {
      try {
        let url = `${API_BASE_URL}/archive-items`;
        const params = new URLSearchParams();

        if (selectedCategory) {
          params.append("categoryId", selectedCategory);
        }
        if (searchTerm.trim()) {
          params.append("search", searchTerm.trim());
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const res = await axios.get(url);
        const publicItems = (res.data || []).filter(
          (item: any) => item.visibility === "public"
        );

        setFilteredItems(publicItems);
      } catch (err) {
        console.error("Filter failed:", err);
      }
    };

    fetchFilteredItems();
  }, [searchTerm, selectedCategory]);



  // For capitalizing the first letter.
  const capitalizeFirstLetter = (str: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };



  const getMediaIcon = (type: string) => {
    switch (type) {
      case "video":
        return <FaVideo className="text-blue-500" size={60} />;
      default:
        return <FaFileAlt className="text-blue-500" size={60} />;
    }
  };



  return (
    <section className="bg-[#F0F0F0]">

      {/* Header component */}
      <Header />
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-6 max-w-8xl">

          <div className="bg-linear-to-b from-[#0047AB] to-[#003380] text-white py-20 mb-12">
            <div className="container mx-auto px-6 text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                Archives
              </h1>
              <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-90">
                Explore the available contributions, documents, and multimedia.
              </p>

              {/* Subtle gold accent line */}
              <div className="w-32 h-1 bg-[#FFD700] mx-auto rounded-full"></div>
            </div>
          </div>

          {/* SearchBar and Category Filter */}
          {/* <div className="rounded-2xl border border-blue-100 p-8 md:p-12 shadow-2xl py-20 bg-linear-to-b from-blue-50 to-white">
          </div> */}

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-[#dddbdb] mb-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
              {/* Search bar */}
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0047AB]" size={22} />
                <input
                  type="text"
                  placeholder="Search archives..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 text-lg border-2 border-[#d6d6d6] rounded-xl focus:outline-none focus:border-[#0047AB]"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-3">
                <FiFilter size={22} className="text-[#0047AB]" />
                <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)} 
                className="bg-white rounded-xl border-2 border-[#d6d6d6] px-6 py-4 focus:border-[#0047AB] focus:outline-none">
                  <option value="">Filter by category (All)</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {capitalizeFirstLetter(category.name)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Archives Grid */}
          {loading ? (
            <p className="text-center text-2xl text-gray-600">Loading archives...</p>
          ) : filteredItems.length === 0 ? (
            <p className="text-center text-2xl text-gray-600">No items found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredItems.map((item) => (
                <Link
                  to={`/archive-items/${item.id}`}
                  key={item.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  <div className="relative h-64 bg-linear-to-br from-[#0047AB]/10 to-[#FFD700]/10">
                    {item.mediaType === "image" ? (
                      <img
                        src={item.cloudServiceUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-6xl">
                        {getMediaIcon(item.mediaType)}
                      </div>
                    )}

                    {item.isOnTheMainPage && (
                      <span className="absolute top-4 right-4 bg-[#FFD700] text-[#333333] px-3 py-1 rounded-full text-sm font-bold">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Title and Description */}
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-[#333333] mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {item.description || "No description available."}
                    </p>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                        })}
                      </span>
                      {/* <span className="text-[#0047AB] font-medium"> */}
                      <span className="text-[#0047AB] font-medium group-hover:text-[#FFD700] transition-colors">
                        View &#8594;
                      </span>
                    </div>
                  </div>

                </Link>
              ))}
            </div>
          )}

        </div>
      </div>
      {/* Footer component */}
      <Footer />

    </section>
  )
}

export default Archives
