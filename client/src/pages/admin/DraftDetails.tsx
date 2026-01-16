/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiCalendar, FiEdit2, FiTag, FiUpload } from "react-icons/fi";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { FaFileAlt } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const DraftDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [draft, setDraft] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDraft = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/drafts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDraft(res.data.draft || res.data);
      } catch (err) {
        setError("Failed to load draft");
      } finally {
        setLoading(false);
      }
    };
    fetchDraft();
  }, [id]);

  const handlePublish = async () => {
    if (!confirm("Publish this draft to make it public?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/drafts/${id}/publish`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Draft published successfully!");
      navigate("/admin/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to publish");
    }
  };

  if (loading) return <div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center text-red-600">{error}</div>;
  if (!draft) return <div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center">Draft not found</div>;

  const formatDate = (date: string) => new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <section className="min-h-screen bg-[#F0F0F0]">
      <Header />

      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 text-[#0047AB] hover:text-[#003380] font-medium mb-8"
        >
          <FiArrowLeft /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Media Preview */}
          <div className="w-full">
            {draft.mediaType === "image" ? (
              <img src={draft.cloudServiceUrl} alt={draft.title} className="w-full max-h-[80vh] object-contain" />
            ) : draft.mediaType === "video" ? (
              <video controls className="w-full max-h-[80vh]">
                <source src={draft.cloudServiceUrl} />
              </video>
            ) : (
              <div className="w-full h-[70vh] bg-linear-to-br from-[#0047AB]/10 to-[#FFD700]/10 flex flex-col items-center justify-center">
                <FaFileAlt size={120} className="text-[#0047AB]/60 mb-6" />
                <p className="text-3xl font-bold text-[#333333]">{draft.title}</p>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-10 md:p-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[#333333] mb-8">{draft.title}</h1>

            <div className="flex flex-wrap gap-8 text-gray-600 mb-10">
              <div className="flex items-center gap-3">
                <FiCalendar size={22} />
                <span className="font-medium">Created on {formatDate(draft.createdAt)}</span>
              </div>
              <div className="flex items-center gap-3">
                <FiCalendar size={22} />
                <span className="font-medium">Updated on {formatDate(draft.updatedAt)}</span>
              </div>
              <div className="flex items-center gap-3">
                <FiTag size={22} />
                <span className="font-medium capitalize">{draft.mediaType}</span>
              </div>
            </div>

            {draft.description && (
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-[#333333] mb-6">Description</h2>
                <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {draft.description}
                </p>
              </div>
            )}

            {/* Admin Actions */}
            <div className="flex flex-wrap gap-6">
              <Link
                to={`/drafts/edit/${draft.id}`}
                className="flex items-center gap-3 px-8 py-4 bg-[#0047AB] text-white rounded-xl hover:bg-[#003380] transition-all shadow-lg font-medium text-lg"
              >
                <FiEdit2 size={20} />
                Edit Draft
              </Link>

              <button
                onClick={handlePublish}
                className="flex items-center gap-3 px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg font-medium text-lg"
              >
                <FiUpload size={20} />
                Publish to Public
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </section>
  );
};

export default DraftDetails;