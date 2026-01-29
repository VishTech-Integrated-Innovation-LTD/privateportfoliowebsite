/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, useNavigate } from "react-router-dom"
import Footer from "../../components/Footer"
import Header from "../../components/Header"
import { FiEdit2, FiPlus, FiSearch, FiTrash2, FiUpload } from "react-icons/fi"
import { useEffect, useState } from "react";
import axios from "axios";
import { FaFolder, FaVideo } from "react-icons/fa6";
import { FaFileAlt } from "react-icons/fa";
import Pagination from "../../components/Pagination";
// import { it } from "node:test";


interface Collection {
    id: string | number;
    name: string;
    description: string;
    createdAt?: string;
}

interface ArchiveItem {
    id: number;
    title: string;
    description: string;
    mediaType: string;
    visibility: string;
    isOnTheMainPage: boolean;
    cloudServiceUrl: string;
    CategoryId: number;
    createdAt: string;
    updatedAt: string;
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

type TabType = "collections" | "items" | "drafts";


const Dashboard = () => {
    const [activeTab, setActiveTab] = useState<TabType>("collections");

    // Collections state
    const [collections, setCollections] = useState<Collection[]>([]);
    const [filteredCollections, setFilteredCollections] = useState<Collection[]>([]);

    // Archive items state
    const [archiveItems, setArchiveItems] = useState<ArchiveItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<ArchiveItem[]>([]);

    // Drafts derived from archive items
    //   const drafts = archiveItems.filter((item) => item.visibility === "private");

    // State for drafts
    const [drafts, setDrafts] = useState<ArchiveItem[]>([]);
    const [filteredDrafts, setFilteredDrafts] = useState<ArchiveItem[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // State for current page
    const [currentPage, setCurrentPage] = useState(1);
    // For search
    const [searchTerm, setSearchTerm] = useState("");

    const itemsPerPage = 8;

    // const [itemCount, setItemCount] = useState();

    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Collection | ArchiveItem | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState<string | null>(null);



    const navigate = useNavigate();


    //   Fetch all data
const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = localStorage.getItem('token');

                const [colRes, itemRes, draftRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/collections`),
                    axios.get(`${API_BASE_URL}/archive-items`),
                    axios.get(`${API_BASE_URL}/drafts`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }), // ← New!
                ]);

                const collectionsData = colRes.data.collections || [];
                const itemsData = itemRes.data || [];



                setCollections(collectionsData);
                setFilteredCollections(collectionsData);
                setArchiveItems(itemsData);
                setFilteredItems(itemsData);
                // Set drafts
                setDrafts(draftRes.data.drafts || []);
                setFilteredDrafts(draftRes.data.drafts || []);
                // setItemCount(response.data.count);
            } catch (error) {
                setError("Failed to load data. Please try again.");
                console.error(error);
                setCollections([]); // fallback to empty
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        fetchData();
    }, [])



    // Search across current tab
    // Live search with debounce
    useEffect(() => {
        if (activeTab === "collections") {
            const filtered = collections.filter(
                (c) =>
                    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredCollections(filtered);
        } else if (activeTab === "items") {
            const filtered = archiveItems.filter(
                (i) =>
                    i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    i.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredItems(filtered);
        }
        else if (activeTab === "drafts") {
            const filtered = drafts.filter(
                (i) =>
                    i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    i.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredDrafts(filtered as ArchiveItem[]);
        }
        setCurrentPage(1);
    }, [searchTerm, collections, archiveItems, activeTab, drafts]);

    // ------------------------------->>
    // Pagnination Logic
    // const totalPages = Math.ceil(collections.length / itemsPerPage);
    // // Calculates the index of the first item to display on the current page
    // const startIndex = (currentPage - 1) * itemsPerPage;
    // // Calculates the index of the last item to display on the current page.
    // const endIndex = startIndex + itemsPerPage;
    // // Extracts a subset of the items/collection array for the current page
    // const currentCollections = collections.slice(startIndex, endIndex);

    // ------------------------------->>
    // Pagination Logic - Fixed to use filtered results
    // const totalPages = Math.ceil(filteredCollections.length / itemsPerPage);
    // const startIndex = (currentPage - 1) * itemsPerPage;
    // const currentCollections = filteredCollections.slice(startIndex, startIndex + itemsPerPage);
    // ------------------------------->>

    const getCurrentData = () => {
        if (activeTab === "collections") return filteredCollections;
        if (activeTab === "items") return filteredItems;
        if (activeTab === "drafts") return filteredDrafts;
        return [];
    };

    const currentData = getCurrentData();
    const totalPages = Math.ceil(currentData.length / itemsPerPage);
    const paginatedData = currentData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // This function updates the current page and scrolls the viewport to the top for a better user experience.
    // const handlePageChange = (page: number) => {
    //     if (page >= 1 && page <= totalPages) {
    //         setCurrentPage(page);
    //         window.scroll({ top: 0, behavior: 'smooth' });
    //     }
    // };

    // ------------------------------->>




    // ------------------------------->>
    // Delete handlers
    // Open delete confirmation
    const openDeleteModal = (item: any) => {
        setItemToDelete(item);
        setDeleteModalOpen(true);
        setDeleteMessage(null);
    };

    // Confirm delete
    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            setDeleting(true);
            const token = localStorage.getItem("token");
            if (!token) {
                setDeleteMessage("You are not authorized. Please log in again.");
                return;
            } // Exit if no token
            const endpoint =
                activeTab === "collections"
                    ? `/collections/${itemToDelete.id}`
                    : `/archive-items/${itemToDelete.id}`;

            const response = await axios.delete(`${API_BASE_URL}${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log('Deleted Item: ', response.data);


            // Remove from local state
            // Update state
            if (activeTab === "collections") {
                setCollections(collections.filter((c) => c.id !== itemToDelete.id));
                setFilteredCollections(filteredCollections.filter((c) => c.id !== itemToDelete.id));
            } else {
                setArchiveItems(archiveItems.filter((i) => i.id !== itemToDelete.id));
                setFilteredItems(filteredItems.filter((i) => i.id !== itemToDelete.id));
            }

            setDeleteMessage("Deleted successfully.");

            // Auto close modal after 2 seconds
            setTimeout(() => {
                setDeleteModalOpen(false);
                setItemToDelete(null);
                setDeleteMessage(null);
            }, 2000);
        } catch (err: any) {
            setDeleteMessage("Failed to delete collection.");
            console.error(err.response.data.message);
        } finally {
            setDeleting(false);
        }
    };


    // Cancel delete
    const cancelDelete = () => {
        setDeleteModalOpen(false);
        setItemToDelete(null);
        setDeleteMessage(null);
    };
    // ------------------------------->>

    // const getMediaIcon = (type: string) => {
    //     switch (type) {
    //       case "image":
    //         return <FaImage className="text-blue-600" size={40} />;
    //       case "video":
    //         return <FaVideo className="text-purple-600" size={40} />;
    //       default:
    //         return <FaFileAlt className="text-gray-600" size={40} />;
    //     }
    //   };



    return (
        <section className="min-h-screen bg-[#F0F0F0]">

            {/* Header component */}
            <Header />

            {/* Main dashboard section */}
            <div className="container mx-auto px-6 py-12 max-w-7xl">
                {/* Title and Action Links/Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between justify-between mb-8 gap-6">

                    <h1 className="font-bold text-4xl text-[#333333]">Admin Dashboard</h1>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            to='/archive-items/upload'
                            // className="flex items-center gap-2 rounded-lg px-6 py-3 font-semibold bg-[#0047AB] text-white hover:bg-[#003380] transition-all shadow-md hover:shadow-lg"
                            className="flex items-center gap-3 justify-center rounded-xl bg-[#0047AB] px-8 py-4 font-semibold hover:bg-white hover:text-[#0047AB] border transition-all hover:shadow-lg shadow-md border-[#0047AB] text-white"
                        >
                            <FiUpload size={22} /> Upload New Item
                        </Link>
                        <Link
                            to='/collections/create'
                            className="flex items-center gap-3 rounded-xl justify-center px-8 py-4 font-semibold bg-[#FFD700] hover:bg-[#e2c105] text-[#333333] transition-all shadow-md hover:shadow-lg"
                        >
                            <FiPlus size={22} /> Create a Collection
                        </Link>
                    </div>

                </div>

                {/* Tabs */}
                <div className="border-b-2 border-gray-200 mb-10">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab("collections")}
                            className={`py-4 px-1 border-b-4 font-medium text-lg transition-all ${activeTab === "collections"
                                ? "border-[#0047AB] text-[#0047AB]"
                                : "border-transparent text-gray-500 hover:text-[#0047AB]"
                                }`}
                        >
                            Collections ({filteredCollections.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("items")}
                            className={`py-4 px-1 border-b-4 font-medium text-lg transition-all ${activeTab === "items"
                                ? "border-[#0047AB] text-[#0047AB]"
                                : "border-transparent text-gray-500 hover:text-[#0047AB]"
                                }`}
                        >
                            Archive Items ({archiveItems.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("drafts")}
                            className={`py-4 px-1 border-b-4 font-medium text-lg transition-all ${activeTab === "drafts"
                                ? "border-[#0047AB] text-[#0047AB]"
                                : "border-transparent text-gray-500 hover:text-[#0047AB]"
                                }`}
                        >
                            Drafts ({drafts.length})
                        </button>

                        {/* // Replace the drafts button with a Link */}
                        {/* <Link
  to="/drafts"
  className={`py-4 px-1 border-b-4 font-medium text-lg transition-all ${
    activeTab === "drafts"
      ? "border-[#0047AB] text-[#0047AB]"
      : "border-transparent text-gray-500 hover:text-[#0047AB]"
  }`}
>
  Drafts ({drafts.length})
</Link> */}
                    </nav>
                </div>


                {/* Search and Filter Bar */}
                {/* <div className="bg-white rounded-2xl shadow-md p-6 border border-[#dddbdb] mb-10"> */}
                {/* <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6"> */}
                {/* Search bar */}
                {/* <div className="relative flex-1 max-w-md">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0047AB]" size={22} />
                            <input
                                type="text"
                                placeholder="Search collections..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 text-lg border-2 border-[#d6d6d6] rounded-xl focus:outline-none focus:border-[#0047AB]"
                            />
                        </div> */}

                {/* Category Filter */}
                {/* <div className="flex items-center gap-3">
                            <FiFilter size={22} className="text-[#0047AB]" />
                            <select name="" className="bg-white rounded-xl border-2 border-[#d6d6d6] px-6 py-4 focus:border-[#0047AB] focus:outline-none">
                                <option value="all">Filter by category (All)</option>
                                <option value="image">Images/Pictures</option>
                                <option value="video">Videos</option>
                                <option value="document">Documents</option>
                            </select>
                        </div> */}
                {/* </div> */}
                {/* </div> */}

                {/* Search */}
                <div className="mb-10">
                    <div className="relative max-w-md">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0047AB]" size={22} />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 text-lg border-2 border-[#d6d6d6] rounded-xl focus:outline-none focus:border-[#0047AB] transition-all"
                        />
                    </div>
                </div>


                {/* Content */}

                {!loading && filteredCollections.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-600">
                            {searchTerm ? `No collections found for "${searchTerm}"` : "No collections yet."}
                        </p>
                    </div>
                )}

                {/* Loading / Error / Empty */}
                {loading && (
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-600">Loading your collections...</p>
                    </div>
                )}

                {error && (
                    <div className="text-center py-20">
                        <p className="text-xl text-red-600">{error}</p>
                    </div>
                )}

                {!loading && !error && collections.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-600">No collections yet.</p>
                        <p className="text-gray-500 mt-4">
                            Start by uploading items and creating your first collection!
                        </p>
                    </div>
                )}

                {loading && <div className="text-center py-20 text-xl text-gray-600">Loading...</div>}
                {error && <div className="text-center py-20 text-xl text-red-600">{error}</div>}

                {!loading && !error && paginatedData.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-600">
                            {searchTerm ? `No ${activeTab} found for "${searchTerm}"` : `No ${activeTab} yet.`}
                        </p>
                    </div>
                )}

                {/* Items Grid */}
                {!loading && !error && paginatedData.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {paginatedData.map((item) => {
                            // const isCollection = activeTab === "collections";
                            const linkTo = activeTab === "collections"
                                ? `/collections/${item.id}`
                                : activeTab === "items"
                                    ? `/archive-items/${item.id}`
                                    : `/drafts/${item.id}`

                            //  const linkTo = isCollection 
                            // ? `/collections/${item.id}`
                            // : `/archive-items/${item.id}`

                            return (
                                <Link
                                    key={item.id}
                                    to={linkTo}
                                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border-[#dddbdb] flex flex-col h-full group"
                                >
                                    {/* Preview  */}
                                    <div className="h-48 flex items-center justify-center bg-linear-to-bl from-[#0047AB]/20 to-[#FFD700]/20 relative overflow-hidden">

                                        {activeTab === "collections" ? (
                                            <FaFolder size={60} className="text-[#0047AB]/70" />
                                        ) : (
                                            <div className="relative w-full h-full flex items-center justify-center">
                                                {(item as ArchiveItem).mediaType === "image" ? (
                                                    <img
                                                        src={(item as ArchiveItem).cloudServiceUrl}
                                                        alt={(item as ArchiveItem).title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (item as ArchiveItem).mediaType === "video" ? (
                                                    <div className="text-6xl text-white bg-[#0047AB]/70 rounded-full p-6">
                                                        <FaVideo />
                                                    </div>
                                                ) : (
                                                    <div className="text-6xl text-white bg-[#0047AB]/70 rounded-full p-6">
                                                        <FaFileAlt />
                                                    </div>
                                                )}
                                            </div>
                                        )}



                                        <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {activeTab === 'collections' && (
                                            <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-sm font-medium">View Items &#8594;</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 flex flex-col grow">
                                        <h3 className="font-bold text-xl text-[#333333] mb-3 line-clamp-3 min-h-18">
                                            {activeTab === "collections" ? (item as Collection).name : (item as ArchiveItem).title}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                                            {item.description || "No description added yet."}
                                        </p>

                                        {/* <p className="text-sm font-medium text-[#797979] mb-6">
                                        {itemCount} archive item{itemCount !== 1 ? "s" : ""}
                                    </p> */}

                                        {activeTab !== "collections" && (
                                            <div className="flex items-center gap-3 mb-6 min-h-8">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${(item as ArchiveItem).visibility === "public"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-orange-100 text-orange-800"
                                                    }`}>
                                                    {(item as ArchiveItem).visibility === "public" ? "Public" : "Draft"}
                                                </span>
                                                {(item as ArchiveItem).isOnTheMainPage && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FFD700] text-[#333333]">
                                                        Featured
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* 'Edit' and 'Delete' Buttons */}
                                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();  // Prevents card click/navigation
                                                    const editPath = activeTab === "collections"
                                                        ? `/collections/edit/${item.id}`
                                                        : activeTab === "items"
                                                            ? `/archive-items/edit/${item.id}`
                                                            : `/drafts/edit/${item.id}`;
                                                    navigate(editPath);
                                                }}
                                                className="flex items-center gap-2 text-[#0047AB] font-medium hover:underline">
                                                <FiEdit2 size={18} />
                                                Edit
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation(); // Prevents card click
                                                    openDeleteModal(item)
                                                }}
                                                className="flex items-center gap-2 text-[#DC3545] font-medium hover:underline">
                                                <FiTrash2 size={18} />
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                </Link>
                            )
                        })}
                    </div>
                )}

                {/* Pagination */}
                {/* {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-3 mt-12">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-5 py-3 rounded-lg bg-white border border-[#d6d6d6] text-[#333333] font-medium hover:bg-[#0047AB] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Previous
                        </button> */}

                {/* Page Numbers */}
                {/* {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-5 py-3 rounded-lg font-medium transition ${currentPage === page
                                    ? "bg-[#0047AB] text-white shadow-lg"
                                    : "bg-white border border-[#d6d6d6] text-[#333333] hover:bg-[#0047AB] hover:text-white"
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-5 py-3 rounded-lg bg-white border border-[#d6d6d6] text-[#333333] font-medium hover:bg-[#0047AB] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Next
                        </button>
                    </div>
                )} */}

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />


            </div>

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && itemToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                        <h3 className="text-2xl font-bold text-[#333333] mb-4">
                            Confirm Delete
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete <strong>"{(itemToDelete as Collection).name || (itemToDelete as ArchiveItem).title}"</strong>?
                            This action cannot be undone.
                            <br /><br />
                            <span className="text-red-600 font-medium">This action cannot be undone.</span>
                        </p>

                        {deleteMessage && (
                            <p className={`text-center mb-4 font-medium ${deleteMessage.includes("success") ? "text-green-600" : "text-red-600"}`}>
                                {deleteMessage}
                            </p>
                        )}

                        <div className="flex gap-4 justify-end">
                            <button
                                onClick={cancelDelete}
                                disabled={deleting}
                                className="px-6 py-3 rounded-xl bg-gray-200 text-[#333333] font-medium hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="px-6 py-3 rounded-xl bg-[#DC3545] text-white font-medium hover:bg-red-700 disabled:opacity-70 transition flex items-center gap-2"
                            >
                                {deleting ? "Deleting..." : "Delete Collection"}
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Footer component */}
            <Footer />

        </section>
    )
}

export default Dashboard
