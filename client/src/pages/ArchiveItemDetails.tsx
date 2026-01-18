/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, useNavigate, useParams } from "react-router-dom"
import Footer from "../components/Footer"
import Header from "../components/Header"
import { FaFileAlt, FaVideo } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";
import { FiCalendar, FiDownload, FiEdit2, FiPlus, FiSave, FiShare2, FiTag, FiTrash2, FiX } from "react-icons/fi";


interface Collection {
  id: string | number;
  name: string;
}

interface ArchiveItem {
  id: string | number;
  title: string;
  description?: string;
  mediaType: "image" | "video" | "document";
  cloudServiceUrl: string;
  createdAt: string;
  updatedAt: string;
  isOnTheMainPage?: boolean;
  category?: string;
  Collections?: Collection[];
  Category?: { id: string | number; name: string };
}

// interface ArchiveItem {
//   id: string | number;
//   title: string;
//   description: string;
//   mediaType: "image" | "video" | "document";
//   cloudServiceUrl: string;
//   createdAt: string;
//   isOnTheMainPage?: boolean;
//   category?: string;
// }

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;


const ArchiveItemDetails = () => {

  // Get item ID from the URL
  const { id } = useParams();

  const [item, setItem] = useState<ArchiveItem | null>(null);

  const [loading, setLoading] = useState(true);

  const [copied, setCopied] = useState(false); // For share feedback

  const [isAdmin, setIsAdmin] = useState(false);
  const [allCollections, setAllCollections] = useState<Collection[]>([]);
  // selectedCollections = an array of selected collection IDs
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // const [showAdminMenu, setShowAdminMenu] = useState(false);

  // !! is a common JavaScript trick to convert truthy/falsy values into true or false.
  // If a token exists; isAdmin = true
  // Simple admin check 
  // const isAdmin = !!localStorage.getItem("token");

  const navigate = useNavigate();



  // <<<<---------------------------------->>>>
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAdmin(!!token);

    const fetchItem = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/archive-items/${id}`);
        console.log("Raw response:", res.data); // debugging

        setItem(res.data.item);
        // setItem(res.data.item || res.data);
      } catch (err) {
        console.error("Failed to fetch item:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCollections = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/collections`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllCollections(res.data.collections || res.data || []);
      } catch (error) {
        console.error("Failed to fetch collections:", error);
      }
    };

    fetchItem();
    if (token) fetchCollections();
  }, [id]);

  // Sync selected collections with current ones on load
  useEffect(() => {
    if (item?.Collections) {
      setSelectedCollections(item.Collections.map((c) => c.id.toString()));
    }
  }, [item]);


  const getMediaIcon = (type: string) => {
    const mediaType = type?.toLowerCase();

    if (mediaType === "video") {
      return <FaVideo className="text-[#0047AB]" size={100} />;
    }
    return <FaFileAlt className="text-[#0047AB]" size={100} />;
  };


  // Loading & Error States
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center">
        <p className="text-2xl text-gray-600">Loading item...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center">
        <p className="text-2xl text-red-600">Item not found.</p>
      </div>
    );
  }


  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });


  // Download Function
  // const handleDownload = () => {
  //   const link = document.createElement("a");
  //   link.href = item.cloudServiceUrl;
  //   link.download = item.title || "archive-item";
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };



const handleDownload = () => {
  let downloadUrl = item.cloudServiceUrl;

  // Add Cloudinary download transformation
  if (downloadUrl.includes('cloudinary.com')) {
    // Insert 'fl_attachment' flag to force download
    downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
  }

  // Get proper file extension
  let fileExtension = '';
  if (item.mediaType === 'image') {
    if (downloadUrl.includes('.png')) fileExtension = '.png';
    else if (downloadUrl.includes('.jpg') || downloadUrl.includes('.jpeg')) fileExtension = '.jpg';
    else if (downloadUrl.includes('.gif')) fileExtension = '.gif';
    else fileExtension = '.jpg';
  } else if (item.mediaType === 'video') {
    if (downloadUrl.includes('.mp4')) fileExtension = '.mp4';
    else if (downloadUrl.includes('.webm')) fileExtension = '.webm';
    else fileExtension = '.mp4';
  } else if (item.mediaType === 'document') {
    if (downloadUrl.includes('.pdf')) fileExtension = '.pdf';
    else if (downloadUrl.includes('.doc')) fileExtension = '.doc';
    else fileExtension = '.pdf';
  }

  const filename = `${item.title}${fileExtension}`;

  // Create and trigger download
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = filename;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};




  // Share Function
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err: any) {
      alert("Failed to copy link. Please copy manually.");
      console.log("Error message:", err);
    }
  };


  // Function to handle deletion
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this item permanently?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/archive-items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Item deleted successfully");
      navigate("/archive-items");
    } catch (err) {
      alert("Failed to delete item");
    }
  };


  // Function for toggling collection
  // This function adds or removes a collection ID from a list called selectedCollections
  // The function parameter: This is the ID of the collection that was clicked.
  // If this collection is already selected, remove it.
  // Otherwise, add it to the selected list.
  const toggleCollection = (collectionId: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collectionId)
        ? prev.filter((id) => id !== collectionId)
        : [...prev, collectionId]
    );
  };


  // Function for saving the new option
  // Figures out which collections to add
  // Figures out which collections to remove
  // Sends those changes to the backend
  const handleSaveCollections = async () => {
    if (!isAdmin || !item) return;
    setAdding(true);
    setAddError(null);

    try {
      const token = localStorage.getItem("token");

      // Current collections (from loaded item)
      const currentIds = item.Collections?.map((c) => c.id.toString()) || [];

      // What changed?
      const addCollectionIds = selectedCollections.filter(
        (cid) => !currentIds.includes(cid)
      );
      const removeCollectionIds = currentIds.filter(
        (cid) => !selectedCollections.includes(cid)
      );

      // If nothing changed; close quietly or show neutral message
      if (addCollectionIds.length === 0 && removeCollectionIds.length === 0) {
        setShowAddModal(false);
        alert("No changes were made.");
        return;
      }

      // Send to backend (only if something changed)
      await axios.put(
        `${API_BASE_URL}/archive-items/${id}`,
        {
          addCollectionIds,
          removeCollectionIds,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh item data to reflect changes
      const res = await axios.get(`${API_BASE_URL}/archive-items/${id}`);
      setItem(res.data.item || res.data);

      // Smart success message
      let message = "Collections updated successfully!";

      if (addCollectionIds.length > 0 && removeCollectionIds.length === 0) {
        message = `Added to ${addCollectionIds.length} collection${addCollectionIds.length > 1 ? 's' : ''}!`;
      } else if (addCollectionIds.length === 0 && removeCollectionIds.length > 0) {
        message = `Removed from ${removeCollectionIds.length} collection${removeCollectionIds.length > 1 ? 's' : ''}!`;
      } else if (addCollectionIds.length > 0 && removeCollectionIds.length > 0) {
        message = `Added to ${addCollectionIds.length} and removed from ${removeCollectionIds.length} collection${(addCollectionIds.length + removeCollectionIds.length) > 1 ? 's' : ''}!`;
      }

      setShowAddModal(false);
      alert(message);

    } catch (err: any) {
      setAddError(err.response?.data?.message || "Failed to update collections");
      console.error(err);
    } finally {
      setAdding(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center">
        <p className="text-2xl text-gray-600">Loading item...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center">
        <p className="text-2xl text-red-600">Item not found.</p>
      </div>
    );
  }



  return (
    <section className="bg-[#F0F0F0]">
      {/* Header component */}
      <Header />
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-6 max-w-5xl">
          <Link
            to={isAdmin ? "/admin/dashboard" : "/archive-items"}
            className="text-[#0047AB] hover:underline font-medium text-lg"
          >
            &#8592; Back to Archives
          </Link>
          {/* <div className="bg-white justify-center items-center h-96 rounded-3xl shadow-2xl overflow-hidden mt-6"> */}
          <div className="bg-white mt-8 rounded-3xl shadow-2xl overflow-hidden">
            {/* Media preview */}
            <div className="w-full  bg-blue-200">
              {item.mediaType === "image" ? (
                <img
                  src={item.cloudServiceUrl}
                  alt={item.title}
                  className="w-full max-h-[80vh] object-contain"
                />
              ) : item.mediaType === "video" ? (
                <video controls className="w-full max-h-[80vh]">
                  <source src={item.cloudServiceUrl} />
                  Your browser does not support video.
                </video>
              )
                : (
                  <div className="w-full h-[70vh] bg-linear-to-br from-[#0047AB]/10 to-[#FFD700]/10 flex flex-col items-center justify-center">
                    {getMediaIcon(item.mediaType)}
                    <p className="text-3xl font-bold text-[#333333] mt-6">{item.title}</p>
                    {/* <a
                      href={item.cloudServiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 px-8 py-4 bg-[#0047AB] text-white rounded-xl hover:bg-[#003380] transition-all shadow-lg flex items-center gap-3 text-lg font-medium"
                    >
                      Open Document
                    </a> */}
                    <button
                      onClick={handleDownload}
                      className="mt-6 px-8 py-4 bg-[#0047AB] text-white rounded-xl hover:bg-[#003380] transition-all shadow-lg flex items-center gap-3 text-lg font-medium"
                    >
                      <FiDownload size={24} />
                      Open Document
                    </button>

                  </div>
                )}
            </div>

            {/* Details */}
            <div className="p-10 md:p-12">
              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-[#333333] mb-8">
                {item.title}
              </h1>

              {/* Metadata */}
              <div className="flex flex-wrap gap-8 text-gray-600 mb-10">

                <div className="flex items-center gap-3">
                  <FiCalendar size={22} />
                  <span className="font-medium">Uploaded on {formatDate(item.createdAt)}</span>
                </div>

                <div className="flex items-center gap-3">
                  <FiCalendar size={22} />
                  <span className="font-medium">Updated on {formatDate(item.updatedAt)}</span>
                </div>

                <div className="flex items-center gap-3">
                  <FiTag size={22} />
                  <span className="font-medium capitalize">{item.mediaType}</span>
                </div>

              </div>




              {/* Action Buttons */}
              <div className="flex flex-wrap gap-6 mb-12">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-4 px-8 py-5 bg-[#0047AB] text-white rounded-xl hover:bg-[#003380] transition-all shadow-lg font-medium text-lg"
                >
                  <FiDownload size={26} />
                  Download
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-4 px-8 py-5 bg-gray-200 text-[#333333] rounded-xl hover:bg-gray-300 transition-all font-medium text-lg"
                >
                  <FiShare2 size={26} />
                  {copied ? "Link Copied!" : "Share"}
                </button>

                {/* Admin-only buttons */}
                {isAdmin && (
                  <div className="flex flex-wrap gap-6">
                    <Link
                      to={`/archive-items/edit/${item.id}`}
                      className="flex items-center gap-4 px-8 py-5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all shadow-lg font-medium text-lg"
                    >
                      <FiEdit2 size={26} />
                      Edit Item
                    </Link>

                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-4 px-8 py-5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg font-medium text-lg"
                    >
                      <FiTrash2 size={26} />
                      Delete
                    </button>

                    {/* Add to Collection Button */}
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="flex items-center gap-4 bg-green-600 text-white rounded-xl hover:bg-green-700 px-8 py-5 transition-all shadow-lg font-medium text-lg"
                    >
                      <FiPlus size={26} />
                      Add to Collection
                    </button>

                  </div>
                )}

                {/* Another option/alternative */}

                {/* {isAdmin && (
  <div className="relative">
    <button
      onClick={() => setShowAdminMenu(!showAdminMenu)}
      className="flex items-center gap-3 px-6 py-4 sm:px-8 sm:py-5 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-all shadow-lg font-medium text-lg"
    >
      <FiSettings size={26} />
      <span className="hidden sm:inline">Admin Actions</span>
    </button>

    {showAdminMenu && (
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl z-10 border border-gray-200">
        <Link
          to={`/admin/archive-items/edit/${item.id}`}
          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-t-xl"
          onClick={() => setShowAdminMenu(false)}
        >
          <FiEdit2 />
          Edit Item
        </Link>
        <button
          onClick={() => { handleDelete(); setShowAdminMenu(false); }}
          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 w-full text-left"
        >
          <FiTrash2 />
          Delete
        </button>
        <button
          onClick={() => { setShowAddModal(true); setShowAdminMenu(false); }}
          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-b-xl w-full text-left"
        >
          <FiPlus />
          Add to Collection
        </button>
      </div>
    )}
  </div>
)} */}


              </div>


              {/* Description */}
              {item.description && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold text-[#333333] mb-6">Description</h2>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              )}

              {/* Part of Collections */}
              {item.Collections && item.Collections.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold text-[#333333] mt-8 mb-8">
                    Part of Collections
                  </h2>
                  <div className="flex flex-wrap gap-5 justify-center items-center">
                    {item.Collections.map((collection) => (
                      <Link
                        key={collection.id}
                        to={`/collections/${collection.id}`}
                        className="px-8 py-5 bg-[#0047AB]/10 text-[#0047AB] rounded-xl hover:bg-[#0047AB]/20 transition-all font-medium text-lg border border-[#0047AB]/30 shadow-md hover:shadow-lg"
                      >
                        {collection.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}


              {/* Public Access Note */}
              <div className="p-8 bg-[#0047AB]/5 rounded-2xl text-center">
                <p className="text-[#0047AB] font-medium text-lg">
                  This is a public archive. All content is freely accessible.
                </p>
              </div>


            </div>

          </div>

        </div>
      </div>

      {/* Add to Collection Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
            >
              <FiX size={20} />
            </button>

            <h3 className="text-2xl font-bold text-[#333333] mb-6">Add to Collection</h3>

            {addError && <p className="text-red-600 mb-4">{addError}</p>}

            <div className="max-h-96 overflow-y-auto mb-6">
              {allCollections.length === 0 ? (
                <p className="text-gray-600 text-center">No collections available.</p>
              ) : (
                allCollections.map((col) => (
                  <label
                    key={col.id}
                    className="flex items-center gap-3 py-3 border-b last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCollections.includes(col.id.toString())}
                      onChange={() => toggleCollection(col.id.toString())}
                      className="h-5 w-5 text-[#0047AB] border-gray-300 rounded"
                    />
                    <span className="text-gray-800 font-medium">{col.name}</span>
                  </label>
                ))
              )}
            </div>

            {/* Cancel and Save button */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCollections}
                disabled={adding}
                className="px-6 py-3 bg-[#0047AB] text-white rounded-xl hover:bg-[#003380] disabled:opacity-60 flex items-center gap-2"
              >
                <FiSave />
                {adding ? "Saving..." : "Save"}
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

export default ArchiveItemDetails
