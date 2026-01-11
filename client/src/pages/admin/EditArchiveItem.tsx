/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, useNavigate, useParams } from "react-router-dom"
import Footer from "../../components/Footer"
import Header from "../../components/Header"
import { FiArrowLeft, FiSave, FiUpload } from "react-icons/fi"
import React, { useEffect, useState } from "react"
import axios from "axios"
import { FaFileAlt } from "react-icons/fa"


const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface Category {
    id: string;
    name: string;
}

const EditArchiveItem = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();


    const [formData, setFormData] = useState({
        title: "",
        description: "",
        CategoryId: "",
        visibility: "public",
        isOnTheMainPage: false,
        cloudServiceUrl: "", // Current URL (for display)
    });


    const [categories, setCategories] = useState<Category[]>([]);
    const [newFile, setNewFile] = useState<File | null>(null); // New file to upload
    const [previewUrl, setPreviewUrl] = useState<string | null>(null); // Local preview
    const [currentMediaType, setCurrentMediaType] = useState<string>(""); // ← only for preview
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Effect to check authentication and fetch data on page mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");

                // Fetch item
                const response = await axios.get(`${API_BASE_URL}/archive-items/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const fetchedItem = response.data.item || response.data;

                // Fetch categories
                const catRes = await axios.get(`${API_BASE_URL}/categories`);
                setCategories(catRes.data.categories || catRes.data || []);


                setFormData({
                    title: fetchedItem.title,
                    description: fetchedItem.description || "",
                    CategoryId: fetchedItem.CategoryId,
                    visibility: fetchedItem.visibility,
                    isOnTheMainPage: fetchedItem.isOnTheMainPage,
                    cloudServiceUrl: fetchedItem.cloudServiceUrl,
                });
                setPreviewUrl(fetchedItem.cloudServiceUrl); // Show current file as preview
                setCurrentMediaType(fetchedItem.mediaType);
            } catch (error) {
                setError("Failed to load item or categories");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);


    // For capitalizing the first letter.
    const capitalizeFirstLetter = (str: string) => {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    // handleChange - for text, textarea, select & checkbox inputs
    // This event comes from an input, textarea, or select element
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        // e.target is the form element that triggered the change
        // Destructures:
        // name → the input’s name attribute
        // value → the input’s current value
        // type → the input type (text, checkbox, etc.)
        const { name, value, type } = e.target;
        //     Updates state using the previous state
        // This is the safe React way to update objects in state

        // ...prev,
        // Copies all existing form data
        // Without this, you'd erase other fields

        // This one function handles:
        // text inputs
        // textareas
        // selects
        // checkboxes
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
        }))
    }


    // handleFileChange - for file uploads
    // This event only applies to file inputs
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewFile(file);

            // Create local preview
            const preview = URL.createObjectURL(file);
            setPreviewUrl(preview);

            // Optional: auto-detect mediaType from file
            if (file.type.startsWith("image/")) {
                setFormData((prev) => ({ ...prev, mediaType: "image" }));
            } else if (file.type.startsWith("video/")) {
                setFormData((prev) => ({ ...prev, mediaType: "video" }));
            } else {
                setFormData((prev) => ({ ...prev, mediaType: "document" }));
            }
        }
    }



    // handleSubmit - submitting the form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");
            const form = new FormData();
            // Loops through all form fields
            // Adds them to FormData
            // Converts values to strings (required by FormData)
            // Append all text fields
            Object.entries(formData).forEach(([key, value]) => {
                form.append(key, value.toString());
            });

            // Append new file if uploaded
            if (newFile) {
                form.append("media", newFile);
            }

            await axios.put(`${API_BASE_URL}/archive-items/${id}`, form, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            })
            alert("Archive item updated successfully!");
            navigate("/admin/dashboard");
        } catch (error: any) {
            setError(error.response?.data?.message || "Failed to update item");
        } finally {
            setSaving(false);
        }
    };


    // Cleanup preview URL on unmount
    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;



    return (
        <section className="min-h-screen bg-[#F0F0F0]">
            <Header />

            <div className="p-6">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">

                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-[#333333]">Edit Archive Item</h1>
                        <Link
                            to="/admin/dashboard"
                            className="flex items-center gap-2 font-semibold text-[#0047AB] hover:text-[#003380]"
                        >
                            <FiArrowLeft /> Back to Dashboard
                        </Link>
                    </div>

                    {error && <p className="text-red-600 mb-6">{error}</p>}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#0047AB] focus:border-[#0047AB] focus:outline-none"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={5}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#0047AB] focus:border-[#0047AB] focus:outline-none"
                            />
                        </div>


                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                name="CategoryId"
                                value={formData.CategoryId}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#0047AB] focus:border-[#0047AB]"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {capitalizeFirstLetter(cat.name)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Current Media Preview */}
                        {previewUrl && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Current Media</label>
                                {currentMediaType === "image" ? (
                                    <img
                                        src={previewUrl}
                                        alt="Current preview"
                                        className="w-full max-h-64 object-contain rounded-lg border border-[#0047AB]"
                                    />
                                ) : currentMediaType === "video" ? (
                                    <video controls className="w-full max-h-64 rounded-lg border border-[#0047AB]">
                                        <source src={previewUrl} />
                                    </video>
                                ) : (
                                    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border border-[#0047AB]">
                                        <FaFileAlt size={80} className="text-blue-500" />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Upload New Media */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Replace Media File (optional)
                            </label>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 px-6 py-3 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                                    <FiUpload />
                                    <span>Choose new file</span>
                                    <input
                                        type="file"
                                        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                                {newFile && <span className="text-sm text-gray-600">{newFile.name}</span>}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Leave empty to keep current file
                            </p>
                        </div>

                        {/* Visibility & Feature */}
                        <div className="flex flex-wrap gap-8">

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="isOnTheMainPage"
                                    checked={formData.isOnTheMainPage}
                                    onChange={handleChange}
                                    className="h-5 w-5 text-[#0047AB] border-gray-300 rounded"
                                />
                                <label className="text-sm font-medium text-gray-700">Feature on Homepage</label>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="visibility"
                                        value="public"
                                        checked={formData.visibility === "public"}
                                        onChange={handleChange}
                                        className="h-5 w-5 text-[#0047AB]"
                                    />
                                    <label className="text-sm font-medium text-gray-700">Public</label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="visibility"
                                        value="private"
                                        checked={formData.visibility === "private"}
                                        onChange={handleChange}
                                        className="h-5 w-5 text-[#0047AB]"
                                    />
                                    <label className="text-sm font-medium text-gray-700">Private (Draft)</label>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end gap-4 mt-10">
                            <button
                                type="button"
                                onClick={() => navigate("/admin/dashboard")}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-3 bg-[#0047AB] text-white rounded-lg hover:bg-[#003380] disabled:opacity-70 flex items-center gap-2"
                            >
                                <FiSave />
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>

                </div>
            </div>

            <Footer />
        </section>
    )
}

export default EditArchiveItem