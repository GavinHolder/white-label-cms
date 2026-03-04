"use client";

import { useState, useEffect } from "react";

interface MediaFile {
  name: string;
  url: string;
  size: number;
  type: string;
  modifiedAt: string;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  filterType?: "image" | "video" | "all";
}

const PER_PAGE = 12;

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  filterType = "all",
}: MediaPickerModalProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/media/files");
      if (!response.ok) {
        console.error("Media fetch failed:", response.status);
        setFiles([]);
        return;
      }
      const data = await response.json();
      setFiles(data.files ?? []);
    } catch (error) {
      console.error("Failed to fetch media:", error);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      setCurrentPage(1);
      setSearchQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType]);

  // Client-side filter + search
  const filtered = files.filter((f) => {
    const matchesType =
      filterType === "all" ||
      (filterType === "image" && f.type.startsWith("image/")) ||
      (filterType === "video" && f.type.startsWith("video/"));
    const matchesSearch =
      !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Client-side pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginatedFiles = filtered.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  const handleSelect = (url: string) => {
    onSelect(url);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="modal-backdrop fade show"
        onClick={onClose}
        style={{ zIndex: 1110 }}
      />

      {/* Modal */}
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        style={{ zIndex: 1115 }}
      >
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title">Select Media</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              />
            </div>

            {/* Body */}
            <div className="modal-body">
              {/* Search */}
              <div className="mb-4">
                <div className="row g-3">
                  <div className="col-12 col-md-8">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by filename..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-4 d-flex align-items-center">
                    <div className="text-muted small">
                      {filtered.length} file{filtered.length !== 1 ? "s" : ""}
                      {filterType !== "all" ? ` (${filterType}s)` : ""}
                    </div>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading media...</p>
                </div>
              ) : paginatedFiles.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-images mb-3 d-block" style={{ fontSize: "3rem", opacity: 0.3 }} />
                  <p>No media files found.</p>
                  {(searchQuery || filterType !== "all") && (
                    <p className="small">Try adjusting your search or upload files via the Media Library.</p>
                  )}
                  {!searchQuery && filterType === "all" && (
                    <p className="small">Upload files in the Media Library to see them here.</p>
                  )}
                </div>
              ) : (
                <>
                  {/* Media Grid */}
                  <div className="row g-3">
                    {paginatedFiles.map((file) => (
                      <div key={file.url} className="col-6 col-md-4 col-lg-3">
                        <div
                          className="card h-100"
                          onClick={() => handleSelect(file.url)}
                          style={{ cursor: "pointer" }}
                        >
                          {/* Thumbnail */}
                          <div
                            className="position-relative bg-light d-flex align-items-center justify-content-center"
                            style={{ paddingTop: "75%", overflow: "hidden" }}
                          >
                            {file.type.startsWith("image/") ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={file.url}
                                alt={file.name}
                                className="position-absolute top-0 start-0 w-100 h-100"
                                style={{ objectFit: "cover" }}
                              />
                            ) : file.type === "application/pdf" ? (
                              <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                                <i className="bi bi-file-earmark-pdf text-danger" style={{ fontSize: "3rem" }} />
                              </div>
                            ) : (
                              <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                                <i className="bi bi-play-circle-fill text-info" style={{ fontSize: "3rem" }} />
                              </div>
                            )}
                          </div>

                          {/* Metadata */}
                          <div className="card-body p-2">
                            <div className="small text-truncate" title={file.name}>
                              {file.name}
                            </div>
                            <div className="small text-muted">
                              {(file.size / 1024).toFixed(0)} KB
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <nav className="mt-4" aria-label="Media pagination">
                      <ul className="pagination justify-content-center">
                        <li
                          className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage((p) => p - 1)}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </button>
                        </li>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                          (page) => (
                            <li
                              key={page}
                              className={`page-item ${currentPage === page ? "active" : ""}`}
                            >
                              <button
                                className="page-link"
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </button>
                            </li>
                          )
                        )}
                        <li
                          className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage((p) => p + 1)}
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
