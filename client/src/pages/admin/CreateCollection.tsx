/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer"
import Header from "../../components/Header"
import { useEffect, useState } from "react";
import axios from "axios";
import { FaFileAlt, FaVideo } from "react-icons/fa";
import { FiAlertCircle, FiCheck } from "react-icons/fi";

interface ArchiveItem {
    id: string | number;
    title: string;
    description: string;
    mediaType: "image" | "video" | "document";
    cloudServiceUrl: string;
}


const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;


const CreateCollection = () => {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const [archiveItems, setArchiveItems] = useState<ArchiveItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    // Fetch all public archive items
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/archive-items`);
                // Filter only public items
                const publicItems = (res.data || []).filter((item: any) => item.visibility === "public");
                setArchiveItems(publicItems);
            } catch (err) {
                setMessage({ text: "Failed to load archive items.", type: "error" });
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, []);

    // "Look at the current list of selected items (prev).
    // If this id is already in the list → remove it
    // Otherwise → add it to the end of the list"
    const toggleItem = (id: string) => {
        setSelectedItems((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setMessage({ text: "Collection name is required.", type: "error" });
            return;
        }
        if (!description.trim()) {
            setMessage({ text: "Description is required.", type: "error" });
            return;
        }
        if (selectedItems.length === 0) {
            setMessage({ text: "Select at least one archive item.", type: "error" });
            return;
        }

        setSubmitting(true);
        setMessage(null);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setMessage({ text: "You must be logged in.", type: "error" });
                setSubmitting(false);
                return;
            }

            await axios.post(
                `${API_BASE_URL}/collections/create`,
                {
                    name: name.trim(),
                    description: description.trim(),
                    archiveIds: selectedItems,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setMessage({ text: "Collection created successfully!", type: "success" });

            setTimeout(() => {
                navigate("/admin/dashboard");
            }, 2000);
        } catch (err: any) {
            const errorMsg =
                err.response?.data?.message || "Failed to create collection.";
            setMessage({ text: errorMsg, type: "error" });
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <section className="bg-[#F0F0F0]">
            {/* Header component */}
            <Header />

            <div className="min-h-screen py-12">
                <div className="container mx-auto px-6 max-w-6xl">

                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-[#333333] mb-2">Create New Collection</h1>
                        <p className="text-[#585656]">Group archive items into a meaningful collection.</p>
                        <p className="text-blue-800 font-semibold pt-2 text-sm"> <span className="text-red-600">Note: </span>Archive items must have been uploaded before adding to a collection.</p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="bg-white rounded-2xl shadow-2xl border p-8 border-[#dfdcdc]"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Name */}
                            <div>
                                <label className="text-[#333333] font-semibold mb-2 text-lg block">
                                    Collection Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter a collection name e.g., Climate Action 2025"
                                    className="w-full px-5 py-4 rounded-xl border-2 border-[#d6d6d6] focus:border-[#0047AB] focus:outline-none transition-all"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-[#333333] font-semibold mb-2 text-lg block">
                                    Collection Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    placeholder="Enter a collection name e.g., Climate Action 2025"
                                    className="w-full px-5 py-4 rounded-xl border-2 border-[#d6d6d6] focus:border-[#0047AB] focus:outline-none transition-all"
                                    required
                                />
                            </div>

                        </div>

                        {/* Selected Count */}
                        <div className="mb-6 p-4 bg-[#0047AB]/5 rounded-xl">
                            <p className="text-lg font-medium text-[#0047AB]">
                                Selected Items: {""}
                                <strong>{selectedItems.length}</strong>
                            </p>
                        </div>

                        {/* Archive Items Grid */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-[#333333] mb-6">
                                Select Archive Items <span className="text-red-500">*</span>
                            </h2>

                            {loading ? (
                                <p className="text-center py-8 text-gray-600">Loading items...</p>
                            ) : archiveItems.length === 0 ? (
                                <p className="text-center py-8 text-gray-600">No public archive items available.</p>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                    {archiveItems.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => toggleItem(String(item.id))}
                                            className={`relative cursor-pointer rounded-xl overflow-hidden border-4 transition-all ${selectedItems.includes(String(item.id))
                                                ? "border-[#FFD700] shadow-xl scale-105"
                                                : "border-transparent hover:border-[#0047AB]/50"
                                                }`}
                                        >
                                            {/* Thumbnail */}
                                            <div className="aspect-square bg-linear-to-br from-[#0047AB]/10 to-[#FFD700]/10 flex items-center justify-center">
                                                {item.mediaType === "image" ? (
                                                    <img
                                                        src={item.cloudServiceUrl}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : item.mediaType === "video" ? (
                                                    <div className="text-6xl text-[#0047AB]/70">
                                                        <FaVideo />
                                                    </div>
                                                ) : (
                                                    <div className="text-6xl text-[#0047AB]/70">
                                                        <FaFileAlt />
                                                    </div>
                                                )}
                                            </div>

                                            {/* This code shows a big white checkmark with a dark overlay only when the item is selected. */}
                                            {/* Checkbox Overlay */}
                                            {selectedItems.includes(String(item.id)) && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <FiCheck size={48} className="text-white" />
                                                </div>
                                            )}

                                            {/* Title */}
                                            <div className="p-3 bg-white">
                                                <p className="text-sm font-medium text-[#333333] line-clamp-2">
                                                    {item.title}
                                                </p>
                                            </div>


                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting || selectedItems.length === 0}
                            className="w-full py-5 rounded-xl bg-[#0047AB] text-white text-xl font-bold hover:bg-[#003380] disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                        >
                            {submitting ? "Creating..." : "Create Collection"}
                        </button>

                        {/* Message */}
                        {message && (
                            <div
                                className={`mt-6 p-5 rounded-xl text-center text-lg font-medium flex items-center justify-center gap-3 ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                    }`}
                            >
                                {message.type === "success" ? <FiCheck size={24} /> : <FiAlertCircle size={24} />}
                                {message.text}
                            </div>
                        )}

                    </form>


                    {/* Back Link */}
                    <div className="mt-8 text-center">
                        <Link
                            to="/admin/dashboard"
                            className="text-[#0047AB] hover:underline font-medium"
                        >
                            &#8592; Back to Dashboard</Link>
                    </div>

                </div>
            </div>
            {/* Footer component */}
            <Footer />
        </section>
    )
}

export default CreateCollection
