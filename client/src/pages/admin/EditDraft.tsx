/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/admin/EditDraft.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FiSave, FiArrowLeft, FiUpload, FiCheckCircle } from "react-icons/fi";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { FaFileAlt } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface Category {
  id: string;
  name: string;
}

const EditDraft = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    CategoryId: "",
    cloudServiceUrl: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentMediaType, setCurrentMediaType] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch draft
        const draftRes = await axios.get(`${API_BASE_URL}/drafts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const draft = draftRes.data.draft || draftRes.data;

        setFormData({
          title: draft.title || "",
          description: draft.description || "",
          CategoryId: draft.CategoryId || "",
          cloudServiceUrl: draft.cloudServiceUrl || "",
        });
        setPreviewUrl(draft.cloudServiceUrl);
        setCurrentMediaType(draft.mediaType || "unknown");

        // Fetch categories
        const catRes = await axios.get(`${API_BASE_URL}/categories`);
        setCategories(catRes.data.categories || catRes.data || []);
      } catch (err) {
        setError("Failed to load draft");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const form = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value.toString());
      });

      if (newFile) {
        form.append("media", newFile);
      }

      await axios.put(`${API_BASE_URL}/drafts/${id}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Draft updated successfully!");
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update draft");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm("Are you sure you want to publish this draft to make it public?")) return;

    setPublishing(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/drafts/${id}/publish`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Draft published successfully! It is now in the Archives.");
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to publish draft");
    } finally {
      setPublishing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (loading) return <div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center text-2xl">Loading...</div>;

  return (
    <section className="min-h-screen bg-[#F0F0F0]">
      <Header />

      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-[#333333]">Edit Draft</h1>
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-2 text-[#0047AB] hover:text-[#003380] font-medium"
            >
              <FiArrowLeft /> Back to Drafts
            </Link>
          </div>

          {error && <p className="text-red-600 bg-red-50 p-4 rounded-lg mb-8">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0047AB]"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0047AB] resize-y"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                name="CategoryId"
                value={formData.CategoryId}
                onChange={handleChange}
                className="w-full px-5 py-3 border capitalize border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0047AB]"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Media Preview */}
            {previewUrl && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Media</label>
                {currentMediaType === "image" ? (
                  <img src={previewUrl} alt="Preview" className="w-full max-h-64 object-contain rounded-xl border border-[#0047AB]" />
                ) : currentMediaType === "video" ? (
                  <video controls className="w-full max-h-64 rounded-xl border">
                    <source src={previewUrl} />
                  </video>
                ) : (
                  <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center border">
                    <FaFileAlt size={80} className="text-gray-500" />
                  </div>
                )}
              </div>
            )}

            {/* Replace File */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Replace Media File (optional)
              </label>
              <label className="flex items-center gap-3 px-6 py-4 bg-gray-100 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-200 transition w-fit">
                <FiUpload />
                <span>Choose new file</span>
                <input
                  type="file"
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {newFile && <p className="text-sm text-gray-600 mt-2">{newFile.name}</p>}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 justify-end pt-8">
              <button
                type="button"
                onClick={() => navigate("/admin/dashboard")}
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-[#0047AB] text-white rounded-xl hover:bg-[#003380] disabled:opacity-70 flex items-center gap-2"
              >
                <FiSave />
                {saving ? "Saving..." : "Save Draft"}
              </button>

              <button
                type="button"
                onClick={handlePublish}
                disabled={publishing}
                className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-70 flex items-center gap-2"
              >
                <FiCheckCircle />
                {publishing ? "Publishing..." : "Publish to Public"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </section>
  );
};

export default EditDraft;