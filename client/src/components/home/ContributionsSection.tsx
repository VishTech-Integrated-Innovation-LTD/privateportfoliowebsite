import axios from "axios";
import { useEffect, useState } from "react";
import { FaFileAlt, FaVideo } from "react-icons/fa";
import { FiSearch } from "react-icons/fi"
import { Link } from "react-router-dom"

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

// Realistic sample data based on the backend structure
// const sampleArchiveItems = [
//     {
//         id: 1,
//         title: "A Monster with a Name and Other Stories",
//         description: "A children's book published in 2025 to teach young readers about the consequences of climate change through engaging cultural storytelling. The collection uses relatable characters and Nigerian contexts to foster environmental awareness.",
//         mediaType: "image",
//         visibility: "public",
//         isOnTheMainPage: true,
//         cloudServiceUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg", // Placeholder – replace with real Cloudinary URLs later
//         CategoryId: 3,
//         createdAt: "2025-03-15T10:00:00.000Z",
//         updatedAt: "2025-03-15T10:00:00.000Z",
//     },
//     {
//         id: 2,
//         title: "Girl Child Education Advocacy Workshop – Abuja 2024",
//         description: "Community outreach program organized in partnership with local schools and NGOs to promote girls' right to education and combat early marriage and dropout rates.",
//         mediaType: "video",
//         visibility: "public",
//         isOnTheMainPage: true,
//         cloudServiceUrl: "https://res.cloudinary.com/demo/video/upload/sample.mp4",
//         CategoryId: 1,
//         createdAt: "2024-11-20T14:30:00.000Z",
//         updatedAt: "2024-11-20T14:30:00.000Z",
//     },
//     {
//         id: 3,
//         title: "National Library Literacy Campaign Launch",
//         description: "Official photographs from the nationwide reading promotion campaign launched at the National Library headquarters, featuring children, authors, and dignitaries.",
//         mediaType: "image",
//         visibility: "public",
//         isOnTheMainPage: false,
//         cloudServiceUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
//         CategoryId: 2,
//         createdAt: "2023-09-10T09:00:00.000Z",
//         updatedAt: "2023-09-10T09:00:00.000Z",
//     },
//     {
//         id: 4,
//         title: "Climate Action Storytelling Session with Primary School Children",
//         description: "Interactive session where stories from 'A Monster with a Name' were shared with pupils to encourage environmental responsibility and creative thinking.",
//         mediaType: "image",
//         visibility: "public",
//         isOnTheMainPage: false,
//         cloudServiceUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
//         CategoryId: 2,
//         createdAt: "2025-05-08T11:00:00.000Z",
//         updatedAt: "2025-05-08T11:00:00.000Z",
//     },
//     {
//         id: 5,
//         title: "Digital Literacy Training for Rural Librarians",
//         description: "Training manual and program report documenting the initiative to equip rural librarians with digital tools for better community service.",
//         mediaType: "document",
//         visibility: "public",
//         isOnTheMainPage: true,
//         cloudServiceUrl: "https://res.cloudinary.com/demo/raw/upload/sample.pdf",
//         CategoryId: 3,
//         createdAt: "2024-06-18T13:00:00.000Z",
//         updatedAt: "2024-06-18T13:00:00.000Z",
//     },
//     {
//         id: 6,
//         title: "Interview on Climate Education Through Literature",
//         description: "Video interview discussing the role of children's literature in environmental education and the inspiration behind 'A Monster with a Name'.",
//         mediaType: "video",
//         visibility: "public",
//         isOnTheMainPage: false,
//         cloudServiceUrl: "https://res.cloudinary.com/demo/video/upload/sample.mp4",
//         CategoryId: 1,
//         createdAt: "2025-04-22T16:00:00.000Z",
//         updatedAt: "2025-04-22T16:00:00.000Z",
//     },
// ];


const ContributionsSection = () => {

    const [items, setItems] = useState<ArchiveItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const fetchItems = async () => {
            try {
                setLoading(true);

                // Only send search param if there's actual text (after trimming)
                const params = searchTerm.trim() ? { search: searchTerm.trim() } : {};

                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/archive-items`,
                    { params }
                );

                const fetchedItems = response.data;
                // let fetchedItems = response.data;

                // Prioritize featured items, then limit to 6
                const featuredItems = fetchedItems.filter((item: ArchiveItem) => item.isOnTheMainPage);
                const sortedItems = featuredItems.length > 0 ? featuredItems : fetchedItems;

                setItems(sortedItems.slice(0, 6));  //Limit to 6 items

            } catch (err) {
                setError("Failed to load contributions.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        // Debounce: wait 500ms after user stops typing before fetching
        const timer = setTimeout(fetchItems, 500);

        // Cleanup: cancel the timer if searchTerm changes before 500ms
        return () => clearTimeout(timer);
        // fetchItems();
    }, [searchTerm]);


    if (loading) return <div className="text-center py-20 text-gray-600">Loading contributions...</div>;
    if (error) return <div className="text-center py-20 text-red-600">{error}</div>;
    if (items.length === 0) return <div className="text-center py-20 text-gray-600">No contributions yet.</div>


    // For now, I'll use sample data. Later: replace with useState + fetch/axios
    // const items = sampleArchiveItems;

    // // Prioritize featured items, then limit to 6
    // const featuredItems = items.filter((item) => item.isOnTheMainPage);
    // const displayItems = featuredItems.length > 0 ? featuredItems : items;
    // const limitedItems = displayItems.slice(0, 6);

    return (
        <section className="py-20 bg-linear-to-b from-blue-50 to-white">
            <div className="container mx-auto px-6 lg:px-8 max-w-7xl">

                {/* Title */}
                <h2 className="text-4xl md:text-5xl font-bold text-[#0047AB] mb-12 text-center uppercase tracking-wider">
                    Her Contributions to the Society
                </h2>

                {/* Search Bar */}
                <div className="relative max-w-2xl mx-auto mb-16">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <FiSearch className="text-[#0047AB]" size={24} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search contributions, books....."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 text-lg border-2 border-[#0047AB]/50 rounded-full focus:outline-none focus:border-[#0047AB]"
                    />
                </div>

                {/* Archive Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {items.map((item) => (
                        <Link
                            key={item.id}
                            to={`/archives/${item.id}`}
                            className="group bg-white block rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 duration-500 overflow-hidden"
                        >
                            {/* Media Preview */}
                            <div className="relative h-48 bg-linear-to-br from-[#0047AB]/10 to-[#FFD700]/20 overflow-hidden">
                                {item.mediaType === 'image' && (
                                    <img
                                        src={item.cloudServiceUrl}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                {item.mediaType === 'video' && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-6xl text-white bg-[#0047AB]/70 rounded-full p-4"><FaVideo /></div>
                                    </div>
                                )}
                                {item.mediaType === 'document' && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-6xl text-white bg-[#0047AB]/70 rounded-full p-4"><FaFileAlt /></div>
                                    </div>
                                )}
                            </div>

                            {/* Card Content */}
                            <div className="p-6">
                                {item.isOnTheMainPage && (
                                    <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-[#FFD700] rounded-full mb-3">
                                        Featured
                                    </span>
                                )}

                                <h3 className="text-xl font-bold text-[#0047AB] mb-2 group-hover:text-[#FFD700] transition-colors line-clamp-2">
                                    {item.title}
                                </h3>

                                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                                    {item.description}
                                </p>

                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">
                                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                        })}
                                    </span>
                                    <span className="text-[#0047AB] font-medium">
                                        View &#8594;
                                    </span>
                                </div>

                            </div>

                        </Link>
                    ))}
                </div>

                {/* View More Button */}
                <div className="text-center">
                    <Link
                        to="/archives"
                        // className="inline-block border-2 text-[#0047AB] rounded-full px-10 py-4 text-lg bg-[#FFD700] hover:text-white hover:bg-[#0047AB] transition-all font-semibold"
                        className="inline-block px-10 py-4 text-lg font-semibold text-[#0047AB] border-2 border-[#0047AB] rounded-full hover:bg-[#0047AB] hover:text-white transition-all duration-300 shadow-md hover:shadow-xl"

                    >
                        View All Contributions &#8594;
                    </Link>
                </div>


            </div>
        </section>
    )
}

export default ContributionsSection
