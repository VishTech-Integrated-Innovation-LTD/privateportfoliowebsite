/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Footer from "../../components/Footer"
import Header from "../../components/Header"
import { FiAlertCircle, FiCheck, FiUpload, FiX } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaFileAlt } from "react-icons/fa";
import imageCompression from 'browser-image-compression';
import { ClipLoader } from "react-spinners";


interface Category {
    id: string
    name: string
}


const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const UploadArchiveItem = () => {

    // file: Stores the actual file the user selects
    const [file, setFile] = useState<File | null>(null);
    // preview: Stores a temporary URL to show image/video preview
    const [preview, setPreview] = useState<string | null>(null);
    // uploading: Shows "Uploading..." while sending
    const [uploading, setUploading] = useState(false);
    // message: Shows success or error after upload
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)
    // Holds all form inputs: title, description, category, visibility (public/private), and whether to feature on homepage
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        CategoryId: "",
        visibility: "public" as "public" | "private",
        isOnTheMainPage: false
    });

    const navigate = useNavigate();

    const [categories, setCategories] = useState<Category[]>([]);

    // States for file compression
    const [compressing, setCompressing] = useState(false);
    const [compressionStatus, setCompressionStatus] = useState<string | null>(null);



    // ---------------------------------->>>
    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/categories`);
                setCategories(res.data || []);
            } catch (err) {
                console.error("Failed to load categories:", err);
            }
        };
        fetchCategories();
    }, []);

    // ---------------------------------->>>

    // handleFileChange - When User Selects a File
    // Gets the selected file
    // Saves it to state
    // For images/videos: creates a preview so user can see it immediately
    // For documents (PDF, Word): no preview (just shows filename)
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) {
            return;
        }

        // setFile(selectedFile);
        let fileToUse = selectedFile;


        // Only compress images
        // Create preview for images and videos
        if (selectedFile.type.startsWith("image/")) {
            try {
                setCompressing(true);
                setCompressionStatus('Compressing image... Please wait');

                const options = {
                    maxSizeMB: 4,               // Target max 4 MB 
                    maxWidthOrHeight: 1920,     // Reasonable max resolution
                    useWebWorker: true,         // Offloads work to web worker (prevents UI freeze)
                    fileType: 'image/webp',     // Modern, efficient format
                }

                const compressedFile = await imageCompression(selectedFile, options);

                console.log(
                    `Original: ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB --|| Compressed: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`
                );

                fileToUse = compressedFile;

                // Create preview from compressed file
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result as string);
                };
                reader.readAsDataURL(fileToUse);
            } catch (error) {
                console.error('Image compression failed:', error);
                setMessage({ text: 'Failed to compress image - uploading original.', type: 'error' });
                // Fall back to original file
                fileToUse = selectedFile;
            } finally {
                setCompressing(false);
                setCompressionStatus(null);
            }
        }
        // Create preview for videos
        else if (selectedFile.type.startsWith("video/")) {
            if (selectedFile.size > 50 * 1024 * 1024) {
                const typeLabel = fileToUse.type.startsWith('video/') ? 'video' : 'document';
                setMessage({
                    text: `Large ${typeLabel} detected (${(fileToUse.size / 1024 / 1024).toFixed(1)} MB). Upload may take longer - please select a lesser a file with lesser size.`,
                    type: "error",
                });
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
        else {
            setPreview(null); // No preview for documents

            // Optional: warn on large non-image files
            if (selectedFile.size > 50 * 1024 * 1024) {
                const typeLabel = fileToUse.type.startsWith('video/') ? 'video' : 'document';
                setMessage({
                    text: `Large ${typeLabel} detected (${(fileToUse.size / 1024 / 1024).toFixed(1)} MB). Upload may take longer - please select a lesser a file with lesser size.`,
                    type: "error",
                });
            }
        }
        setFile(fileToUse);
    };


    // handleSubmit - When User Clicks "Upload Item"
    // Prevents default form behavior
    // Checks required fields
    // Creates FormData object (needed for file uploads)
    // Adds file and all form fields exactly as the backend expects
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            setMessage({ text: "Please select a file to upload.", type: "error" });
            return;
        }

        // NEW: Hard client-side limit (matches backend Multer)
        if (file.size > 50 * 1024 * 1024) {
            setMessage({
                text: "File is too large. Maximum allowed size is 50 MB.",
                type: "error",
            });
            return;
        }


        if (!formData.title.trim()) {
            setMessage({ text: "Title is required.", type: "error" });
            return;
        }

        if (!formData.CategoryId) {
            setMessage({ text: "Please select a category.", type: "error" });
            return;
        }

        setUploading(true);
        setMessage(null);

        const data = new FormData();
        data.append("media", file);
        data.append("title", formData.title)
        data.append("description", formData.description)
        data.append("CategoryId", formData.CategoryId)
        data.append("visibility", formData.visibility)
        if (formData.visibility === "public") {
            // Sends "true" or "false" as string
            data.append("isOnTheMainPage", formData.isOnTheMainPage.toString());
        }

        try {
            // Gets auth token from localStorage
            // Sends request with token and file
            // On success: shows green message, waits 2 seconds, redirects to dashboard
            // On error: shows red message with details
            const token = localStorage.getItem("token");
            if (!token) {
                setMessage({ text: "You must be logged in to upload.", type: "error" });
                setUploading(false);
                return;
            }

            await axios.post(`${API_BASE_URL}/archive-items/upload`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"  // Required for file upload
                }
            })

            setMessage({ text: "Item uploaded successfully!", type: "success" });

            // Reset everything
            setFile(null);
            setPreview(null);
            setFormData({
                title: "",
                description: "",
                CategoryId: "",
                visibility: "public",
                isOnTheMainPage: false,
            });

            // Redirect after 2 seconds
            setTimeout(() => {
                navigate("/admin/dashboard");
            }, 2000);

        } catch (err: any) {
            const errorMsg =
                err.response?.data?.message || "Upload failed. Please try again.";
            setMessage({ text: errorMsg, type: "error" });
            console.error(err);
        } finally {
            setUploading(false);
        }
    }


    const capitalizeFirstLetter = (str: string) => {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };


    // Determine what to show in preview
    const renderPreview = () => {
        if (!file) return null;

        const ext = file.name.split(".").pop()?.toLowerCase();

        if (preview && (file.type.startsWith("image/") || ["mp4", "webm", "ogg"].includes(ext || ""))) {
            if (file.type.startsWith("image/")) {
                return <img src={preview} alt="Preview" className="max-h-96 mx-auto rounded-lg shadow-lg" />;
            }
            if (file.type.startsWith("video/")) {
                return (
                    <video controls className="max-h-96 mx-auto rounded-lg shadow-lg">
                        <source src={preview} type={file.type} />
                    </video>
                );
            }
        }

        // Default: Document icon
        return (
            <div className="text-center">
                <FaFileAlt size={100} className="mx-auto text-[#0047AB]/70 mb-4" />
                <p className="text-lg font-medium text-[#333333]">{file.name}</p>
                <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
            </div>
        );
    };


    return (
        <section className="bg-[#F0F0F0]">

            {/* Header component */}
            <Header />

            <div className="min-h-screen py-12">
                <div className="container mx-auto px-6 max-w-4xl">

                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-[#333333] mb-2">Upload New Archive Item</h1>
                        <p className="text-[#585656]">Add images, videos, or documents to your archive.</p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="bg-white rounded-2xl shadow-2xl border p-8 border-[#dfdcdc]"
                    >
                        {/* File Upload Area */}
                        {/* <div className="mb-8">
                            <label className="text-[#333333] font-semibold mb-4 text-lg block">
                                Upload File <span className="text-red-500">*</span>
                            </label>

                            <div
                                className={`border-4 border-dashed rounded-2xl p-12 text-center transition-all
                            ${file ? "border-[#0047AB] bg-[#0047AB]/5" : "border-gray-300 hover:border-[#0047AB]"}`}>
                                {preview ? (
                                    // Show image/video preview or document icon
                                    <div className="relative">
                                        {file?.type.startsWith("image/") && (
                                            <img src={preview} alt="Preview" className="max-h-96 mx-auto rounded-lg" />
                                        )}
                                        {file?.type.startsWith("video/") && (
                                            <video controls className="max-h-96 mx-auto rounded-lg">
                                                <source src={preview} />
                                            </video>
                                        )}
                                        <button type="button"
                                            onClick={() => {
                                                setFile(null);
                                                setPreview(null);
                                            }}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                                        >
                                            <FiX size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <FiUpload size={60} className="mb-4 mx-auto text-[#0047AB]" />
                                        <p className="text-xl text-gray-600 mb-2">Drag & drop your file here</p>
                                        <p className="text-sm text-gray-500 mb-4">or</p>
                                        <label className="cursor-pointer">
                                            <span className="inline-block bg-[#0047AB] px-8 py-4 text-white font-semibold rounded-xl hover:bg-[#003380] transition">Choose File</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx"
                                                onChange={handleFileChange}
                                                required
                                            />
                                        </label>
                                    </div>
                                )}

                                {file && (
                                    <p className="mt-4 text-sm text-gray-600">
                                        Selected File: <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                    </p>
                                )}
                            </div>
                        </div> */}

                        <div className="mb-8">
                            <label className="text-[#333333] font-semibold mb-4 text-lg block">
                                Upload File <span className="text-red-500">*</span>
                            </label>

                            {/* New guidance box */}
                            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
                                <p className="font-medium mb-1">File size guidelines:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Images: ideally under 5 MB(will automatically be compressed)</li>
                                    <li>Videos: preferably under 50 MB(larger files may take longer to upload)</li>
                                    <li>Documents (PDF, Word, etc.): up to 50 MB</li>
                                    <li>Files over 50 MB will be rejected</li>
                                </ul>
                            </div>

                            <div
                                className={`border-4 border-dashed rounded-2xl p-12 text-center transition-all ${file ? "border-[#0047AB] bg-[#0047AB]/5" : "border-gray-300 hover:border-[#0047AB]"
                                    }`}
                            >
                                {file ? (
                                    <div className="relative">
                                        {renderPreview()}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFile(null);
                                                setPreview(null);
                                            }}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                                        >
                                            <FiX size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <FiUpload size={60} className="mb-4 mx-auto text-[#0047AB]" />
                                        <p className="text-xl text-gray-600 mb-2">Drag & drop your file here</p>
                                        <p className="text-sm text-gray-500 mb-4">or</p>
                                        <label className="cursor-pointer">
                                            <span className="inline-block bg-[#0047AB] px-8 py-4 text-white font-semibold rounded-xl hover:bg-[#003380] transition">
                                                Choose File
                                            </span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx"
                                                onChange={handleFileChange}
                                                required
                                            />
                                        </label>
                                    </div>
                                )}

                                {file && (
                                    <p className="mt-4 text-sm text-gray-600">
                                        Selected File: <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                        {file.size > 50 * 1024 * 1024 && (
                                            <span className="text-red-600 ml-2 font-bold">&#8594; Large file - Upload a lesser file</span>
                                        )}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Show Compression Feedback */}
                        {compressing && (
                            <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-xl flex items-center gap-3">
                                <ClipLoader size={24} color="#0047AB" />
                                <span>{compressionStatus || 'Compressing image...'}</span>
                            </div>
                        )}

                        {/* Form fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Title */}
                            <div>
                                <label className="text-[#333333] font-semibold mb-2 text-lg block">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter a descriptive title"
                                    className="w-full px-5 py-4 rounded-xl border-2 border-[#d6d6d6] focus:border-[#0047AB] focus:outline-none transition-all"
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="text-[#333333] font-semibold mb-2 text-lg block">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.CategoryId}
                                    onChange={(e) => setFormData({ ...formData, CategoryId: e.target.value })}
                                    className="w-full px-5 py-4 rounded-xl border-2 border-[#d6d6d6] focus:border-[#0047AB] focus:outline-none transition-all"
                                    required
                                >
                                    <option value="">Select category</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {capitalizeFirstLetter(category.name)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-[#333333] font-semibold mb-2 text-lg block">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                placeholder="Add context, story, or details about this item..."
                                className="w-full px-5 py-4 rounded-xl border-2 border-[#d6d6d6] focus:border-[#0047AB] focus:outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Visibility */}
                            <div>
                                <label className="text-[#333333] font-semibold mb-2 text-lg block">
                                    Visibility <span className="text-red-500">*</span>
                                </label>
                                <div>
                                    <label
                                        className="flex items-center gap-4 cursor-pointer"
                                    >
                                        <input
                                            type="radio"
                                            name="visibility"
                                            checked={formData.visibility === "public"}
                                            value={"public"}
                                            onChange={(_e) => setFormData({ ...formData, visibility: "public" })}
                                            className="w-5 h-5"
                                        />
                                        <div>
                                            <div>
                                                <p className="font-medium">Public</p>
                                                <p className="text-sm text-gray-600">Visible on the main site and archives</p>
                                            </div>
                                        </div>
                                    </label>

                                    <label
                                        className="flex items-center gap-4 cursor-pointer"
                                    >
                                        <input
                                            type="radio"
                                            name="visibility"
                                            value={"private"}
                                            checked={formData.visibility === "private"}
                                            onChange={(_e) => setFormData({ ...formData, visibility: "private" })}
                                            className="w-5 h-5"
                                        />
                                        <div>
                                            <div>
                                                <p className="font-medium">Private (Draft)</p>
                                                <p className="text-sm text-gray-600">Saved as draft - not public yet</p>
                                            </div>
                                        </div>
                                    </label>

                                </div>
                            </div>

                            {/* Featured */}
                            <div>
                                <label className="flex items-center gap-4 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isOnTheMainPage}
                                        onChange={(e) => setFormData({ ...formData, isOnTheMainPage: e.target.checked })}
                                        className="w-6 h-6 rounded"
                                    />
                                    <div>
                                        <p className="font-semibold text-lg">Feature on Homepage</p>
                                        <p className="text-sm text-gray-600">Highlight this item on the main page</p>
                                    </div>
                                </label>
                            </div>

                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={uploading || compressing}
                            className={`w-full py-5 rounded-xl bg-[#0047AB] text-white text-xl font-bold flex items-center justify-center gap-3 hover:bg-[#003380] transition-all shadow-lg hover:shadow-xl ${uploading || compressing
                                    ? "opacity-50 cursor-not-allowed"
                                    : "cursor-pointer"
                                }`}
                        >
                            <FiUpload size={28} />
                            {compressing ? 'Compressing...' : uploading ? "Uploading..." : "Upload Item"}
                        </button>

                        {/* Message */}
                        {message && (
                            <div
                                className={`mt-6 p-5 rounded-xl text-center text-lg font-medium ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
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

export default UploadArchiveItem
