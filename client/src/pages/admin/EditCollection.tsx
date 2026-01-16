/* eslint-disable @typescript-eslint/no-explicit-any */
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useEffect, useState } from 'react';
import { FiArrowLeft, FiPlus, FiSave, FiTrash2 } from 'react-icons/fi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface ArchiveItem {
  id: string | number;
  title: string;
  description?: string;
  mediaType: string;
  cloudServiceUrl: string;
  createdAt: string;
}

const EditCollection = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Items currently in the collection (can change).
  const [currentItems, setCurrentItems] = useState<ArchiveItem[]>([]);
  // Items originally in the collection (never changes).
  const [originalItems, setOriginalItems] = useState<ArchiveItem[]>([]); // Set ONLY once
  // All archive items available in the system.
  const [allItems, setAllItems] = useState<ArchiveItem[]>([]);
  // The dropdown-selected item ID to add.
  const [selectedItemToAdd, setSelectedItemToAdd] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data ONLY once on mount
  useEffect(() => {
    // Safety flag to prevent setting state after unmount.
    let isMounted = true;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const colRes = await axios.get(`${API_BASE_URL}/collections/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const collection = colRes.data.collection || colRes.data;

        if (!isMounted) return;

        // Populate form
        setFormData({ name: collection.name, description: collection.description || "" });

        // Store items
        const fetchedItems = collection.items || [];
        setCurrentItems(fetchedItems);
        setOriginalItems([...fetchedItems]); // ← Set original ONLY here, once!

        // Fetch ALL archive items
        // Used for the 'Add item' dropdown.
        const itemRes = await axios.get(`${API_BASE_URL}/archive-items`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllItems(itemRes.data || []);
      } catch (err) {
        if (isMounted) setError("Failed to load data");
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [id]); // No dependency on state — runs only once per page load


  // Handles typing in name/description.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // name: input name attribute
    // value: typed value
    const { name, value } = e.target;
    // Updates only the changed field.
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add item to collection
  // Triggered by 'Add' button.
  const addItem = () => {
    if (!selectedItemToAdd) return;

    // Keep as string — no Number() needed
    // Finds the selected archive item.
    const itemToAdd = allItems.find((i) => i.id.toString() === selectedItemToAdd.toString());

    // Prevents duplicates.
    if (itemToAdd && !currentItems.some((i) => i.id.toString() === itemToAdd.id.toString())) {
      // Adds item and resets dropdown.
      setCurrentItems([...currentItems, itemToAdd]);
      setSelectedItemToAdd("");
    }
  };


  // Remove item
  const removeItem = (itemId: string | number) => {
    setCurrentItems(currentItems.filter((i) => i.id !== itemId));
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Collection name is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      const currentIds = currentItems.map((i) => i.id.toString());
      const originalIds = originalItems.map((i) => i.id.toString());

      // Items newly added.
      const addItemIds = currentIds.filter((id) => !originalIds.includes(id));
      //  Items removed.
      const removeItemIds = originalIds.filter((id) => !currentIds.includes(id));

      console.log("=== BEFORE SAVE ===");
      console.log("Original IDs:", originalIds);
      console.log("Current IDs:", currentIds);
      console.log("To ADD:", addItemIds);
      console.log("To REMOVE:", removeItemIds);

      await axios.put(
        `${API_BASE_URL}/collections/${id}`,
        {
          name: formData.name.trim(),
          description: formData.description.trim(),
          addItemIds,
          removeItemIds,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Optional: refresh page or state after save
      alert("Collection updated successfully!");
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update collection");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (loading) return <div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center text-2xl">Loading...</div>;

  return (
    <section className="min-h-screen bg-[#F0F0F0]">
      <Header />

      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-[#333333]">Edit Collection</h1>
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-2 text-[#0047AB] hover:text-[#003380] font-medium"
            >
              <FiArrowLeft /> Back to Dashboard
            </Link>
          </div>

          {error && <p className="text-red-600 bg-red-50 p-4 rounded-lg mb-8">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
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
                rows={5}
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0047AB] resize-y"
              />
            </div>

            {/* Manage Items */}
            <div className="mt-10">
              <h2 className="text-2xl font-bold text-[#333333] mb-6">
                Archive Items in this Collection ({currentItems.length})
              </h2>

              <div className="flex flex-wrap gap-4 items-end mb-8">
                <div className="flex-1 min-w-[300px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add an existing archive item
                  </label>
                  <select
                    value={selectedItemToAdd}
                    onChange={(e) => setSelectedItemToAdd(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0047AB]"
                  >
                    <option value="">Select archive item to add...</option>
                    {allItems
                      .filter((i) => !currentItems.some((ci) => ci.id === i.id))
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.title} ({item.mediaType})
                        </option>
                      ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  disabled={!selectedItemToAdd}
                  className="px-6 py-3 bg-[#0047AB] text-white rounded-xl hover:bg-[#003380] disabled:opacity-50 flex items-center gap-2"
                >
                  <FiPlus /> Add
                </button>
              </div>

              {currentItems.length === 0 ? (
                <p className="text-gray-500 text-center py-10">No items in this collection yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-[#0047AB] transition-all flex flex-col"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-[#333333] line-clamp-2 flex-1">
                          {item.title}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Remove from collection"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {item.description || "No description"}
                      </p>

                      <div className="text-xs text-gray-500 mt-auto">
                        {item.mediaType} • {formatDate(item.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4 mt-8">
              <button
                type="button"
                onClick={() => navigate("/admin/dashboard")}
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-[#0047AB] text-white rounded-xl hover:bg-[#003380] disabled:opacity-70 flex items-center gap-2"
              >
                <FiSave />
                {saving ? "Saving..." : "Save Collection"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </section>
  );
};

export default EditCollection;








// This code lets an admin edit a collection, compare original and
// current items, and efficiently sync only the changes to the database.