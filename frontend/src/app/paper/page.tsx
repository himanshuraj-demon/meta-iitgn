"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { apiService } from "@/api";
import toast from "react-hot-toast";
import { type Paper } from "@/lib/types";
import { departments, years } from "@/lib/types";

const Home = () => {
  const { user } = useAuth();

  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPapers, setTotalPapers] = useState(0);
  const limit = 8;

  const fetchPapers = useCallback(async () => {
    setLoading(true);

    try {
      const response = await apiService.getPapers({
        search: debouncedSearch,
        department,
        year,
        page,
        limit,
      });

      if (response.success) {
        setPapers(response.data.papers);
        setTotalPages(response.data.totalPages);
        setTotalPapers(response.data.total);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load papers");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, department, year, page]);

  // Debounce search query changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  // Reset page to 1 when search or filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, department, year]);

  // Fetch papers when search, filters, or page change
  useEffect(() => {
    fetchPapers();
  }, [debouncedSearch, department, year, page, fetchPapers]);

  const handleDownload = async (paperId: number, pdfUrl: string) => {
    try {
      const response = await apiService.downloadPaper(paperId);

      if (response.success) {
        setPapers((prevPapers) =>
          prevPapers.map((paper) =>
            paper.paper_id === paperId
              ? { ...paper, downloads: response.data.downloads }
              : paper
          )
        );
      }
    } catch (err) {
      console.error("Failed to increment download count:", err);
    } finally {
      window.open(pdfUrl, "_blank");
    }
  };

  const handlePreview = (pdfUrl: string) => {
    window.open(pdfUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-transparent text-primary font-sans pb-16 mt-15">
      <main className="max-w-7xl mx-auto px-6 pt-8">
        <div className=" pb-6 mb-3 flex flex-col  md:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-primary tracking-tight">
              Find Previous Year Question Papers
            </h1>
            <p className="text-sm text-slate-400 mt-1 text-wrap">
              This is a centralized repository where IITGN students can search,
              preview, and download previous semester exam papers by course,
              department, year, or exam type. Help future students by uploading
              papers they already have.
            </p>
          </div>
          <div className="px-1 flex items-center justify-center w-full mt-3">
            <Link
              href={user ? "/paper/upload" : "/login"}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-xs font-bold transition shadow-sm"
            >
              <span>Upload paper</span>
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </Link>
          </div>
          <div>
            <p className="text-red-400 text-center">
              Upload paper if it does not exist here !!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 bg-tranparent p-4 rounded border border-primary">
          <div className="md:col-span-2 relative">
            <input
              type="text"
              placeholder="Search course code or name (e.g. CS101)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 rounded border border-primary bg-transparent  h-full font-medium text-base-content placeholder-base-content/40 focus:outline-none focus-within:bg-base-100 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 text-xs"
            />
          </div>

          <div>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 rounded border border-primary bg-transparent  h-full font-medium text-base-content placeholder-base-content/40 focus:outline-none focus-within:bg-base-100 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 text-xs cursor-pointer"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3 py-2 rounded border border-primary bg-transparent  h-full font-medium text-base-content placeholder-base-content/40 focus:outline-none focus-within:bg-base-100 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 text-xs cursor-pointer"
            >
              <option value="">All Years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-slate-400 text-xs">Querying database...</p>
          </div>
        ) : papers.length === 0 ? (
          <div className="text-center py-12 rounded border border-dashed border-[#1e293b] bg-[#0f172a]/20">
            <p className="text-slate-400 text-sm font-semibold">
              No exam papers found
            </p>
            <p className="text-slate-500 text-xs mt-1">
              Adjust search parameters or contribute a new paper.
            </p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {papers.map((paper) => (
                <div
                  key={paper.paper_id}
                  className="card bg-base-100 border border-base-300 hover:border-primary transition-colors"
                >
                  <div className="card-body p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="badge badge-info badge-sm uppercase font-bold tracking-wide">
                        {paper.exam_type}
                      </span>
                      <span className="text-[10px] font-semibold text-base-content/60">
                        {paper.year}
                      </span>
                    </div>

                    <div className="font-mono text-xs font-bold text-base-content/70">
                      {paper.course_code}
                    </div>
                    <h3 className="card-title text-sm leading-tight mt-1 mb-3 truncate">
                      {paper.course_name}
                    </h3>

                    <div className="border-t border-base-300 pt-2.5 mb-4 text-[11px] text-base-content/60 space-y-1">
                      <div className="flex justify-between">
                        <span>Dept:</span>
                        <span className="text-base-content font-semibold">
                          {paper.department}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Semester:</span>
                        <span className="text-base-content font-semibold">
                          {paper.semester}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Downloads:</span>
                        <span className="text-base-content font-semibold font-mono">
                          {paper.downloads}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handlePreview(paper.pdf_url)}
                        className="btn btn-sm btn-outline"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() =>
                          handleDownload(paper.paper_id, paper.pdf_url)
                        }
                        className="btn btn-sm btn-primary"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-base-300 pt-4 text-xs">
                <p className="text-base-content/60">
                  Showing{" "}
                  <span className="font-semibold text-base-content">
                    {(page - 1) * limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-base-content">
                    {Math.min(page * limit, totalPapers)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-base-content">
                    {totalPapers}
                  </span>{" "}
                  results
                </p>
                <div className="join">
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="join-item btn btn-sm"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={page === totalPages}
                    className="join-item btn btn-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
