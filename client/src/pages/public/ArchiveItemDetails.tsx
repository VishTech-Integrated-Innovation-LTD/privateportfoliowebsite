/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, useParams } from "react-router-dom"
import Footer from "../../components/Footer"
import Header from "../../components/Header"
import { FaFileAlt, FaVideo } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";
import { FiCalendar, FiDownload, FiShare2, FiTag } from "react-icons/fi";


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




  // <<<<---------------------------------->>>>
  useEffect(() => {
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
    fetchItem();
  }, [id]);


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
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = item.cloudServiceUrl;
    link.download = item.title || "archive-item";
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



  return (
    <section className="bg-[#F0F0F0]">
      {/* Header component */}
      <Header />
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-6 max-w-5xl">
          <Link
            to="/archive-items"
            className="text-[#0047AB] hover:underline font-medium text-lg"
          >
            &#8592; Back to Archives
          </Link>
          {/* <div className="bg-white justify-center items-center h-96 rounded-3xl shadow-2xl overflow-hidden mt-6"> */}
          <div className="bg-white mt-8 rounded-3xl shadow-2xl overflow-hidden">
            {/* Media preview */}
            <div className="w-full">
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

      {/* Footer component */}
      <Footer />
    </section>
  )
}

export default ArchiveItemDetails
