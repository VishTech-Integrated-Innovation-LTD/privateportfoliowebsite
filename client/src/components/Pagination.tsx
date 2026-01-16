interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange
}) => {

    if (totalPages <= 1) return null;

    // This function updates the current page and scrolls the viewport to the top for a better user experience.
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
            window.scroll({ top: 0, behavior: 'smooth' });
        }
    };


    return (
        <div className="flex justify-center items-center gap-3 mt-12">
            {/* Previous */}
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-5 py-3 rounded-lg bg-white border border-[#d6d6d6] text-[#333333] font-medium hover:bg-[#0047AB] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
                Previous
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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

            {/* Next */}
            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-5 py-3 rounded-lg bg-white border border-[#d6d6d6] text-[#333333] font-medium hover:bg-[#0047AB] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
                Next
            </button>
        </div>
    )
}

export default Pagination;
