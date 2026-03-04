"use client";

import { useState, useRef } from "react";
import { useToast } from "./ToastProvider";

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (url: string) => void;
  acceptedTypes?: string; // e.g., "image/*" or "video/*"
}

export default function MediaUploadModal({
  isOpen,
  onClose,
  onUploadComplete,
  acceptedTypes = "image/*,video/*",
}: MediaUploadModalProps) {
  const toast = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Set default alt text from filename
    setAltText(file.name.split(".")[0].replace(/[-_]/g, " "));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("altText", altText);
      formData.append("caption", caption);
      formData.append("tags", tags);

      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
        credentials: "include", // Include cookies for authentication
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUploadProgress(100);
        toast.success("Media uploaded successfully!");
        // API returns data.data.media.url
        onUploadComplete(data.data?.media?.url || data.data?.url || "");
        handleClose();
      } else {
        console.error("Upload failed:", data.error);
        // Extract human-friendly message from error object
        const errorMessage = typeof data.error === "object"
          ? data.error.message || "Something went wrong. Please try again."
          : data.error || "Something went wrong. Please try again.";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Please try again";
      toast.error(`Upload failed: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    // Clean up preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    // Reset state
    setSelectedFile(null);
    setPreviewUrl("");
    setAltText("");
    setCaption("");
    setTags("");
    setUploadProgress(0);

    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="modal-backdrop fade show"
        onClick={handleClose}
        style={{ zIndex: 1110 }}
      />

      {/* Modal */}
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        style={{ zIndex: 1115 }}
      >
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title">Upload Media</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
                aria-label="Close"
                disabled={isUploading}
              />
            </div>

            {/* Body */}
            <div className="modal-body">
              {!selectedFile ? (
                <>
                  {/* File Input Area */}
                  <div
                    className={`border rounded p-5 text-center ${
                      isDragging ? "border-primary bg-light" : "border-secondary"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{ cursor: "pointer" }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="mb-3" style={{ fontSize: "3rem" }}>
                      📁
                    </div>
                    <h6>Drag and drop a file here</h6>
                    <p className="text-muted mb-3">or</p>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      Browse Files
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="d-none"
                      accept={acceptedTypes}
                      onChange={handleFileInputChange}
                    />
                    <p className="text-muted small mt-3 mb-0">
                      Accepted formats: Images (JPG, PNG, WebP), Videos (MP4, WebM)
                      <br />
                      Max file size: 10MB
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Preview and Metadata */}
                  <div className="row g-4">
                    {/* Preview */}
                    <div className="col-12 col-md-6">
                      <h6>Preview</h6>
                      <div
                        className="border rounded bg-light d-flex align-items-center justify-content-center"
                        style={{ height: "300px", overflow: "hidden" }}
                      >
                        {selectedFile.type.startsWith("image/") ? (
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="img-fluid"
                            style={{ maxHeight: "100%", objectFit: "contain" }}
                          />
                        ) : selectedFile.type.startsWith("video/") ? (
                          <video
                            src={previewUrl}
                            controls
                            className="w-100"
                            style={{ maxHeight: "100%" }}
                          />
                        ) : (
                          <div className="text-muted">No preview available</div>
                        )}
                      </div>
                      <div className="mt-2">
                        <div className="small text-muted">
                          <strong>File:</strong> {selectedFile.name}
                        </div>
                        <div className="small text-muted">
                          <strong>Size:</strong>{" "}
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary mt-2"
                        onClick={() => {
                          if (previewUrl) {
                            URL.revokeObjectURL(previewUrl);
                          }
                          setSelectedFile(null);
                          setPreviewUrl("");
                        }}
                        disabled={isUploading}
                      >
                        Choose Different File
                      </button>
                    </div>

                    {/* Metadata Form */}
                    <div className="col-12 col-md-6">
                      <h6>Media Details</h6>
                      <div className="mb-3">
                        <label className="form-label">
                          Alt Text <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={altText}
                          onChange={(e) => setAltText(e.target.value)}
                          placeholder="Describe the image for accessibility"
                          disabled={isUploading}
                          required
                        />
                        <div className="form-text">
                          Used for screen readers and SEO
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Caption</label>
                        <input
                          type="text"
                          className="form-control"
                          value={caption}
                          onChange={(e) => setCaption(e.target.value)}
                          placeholder="Optional caption"
                          disabled={isUploading}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Tags</label>
                        <input
                          type="text"
                          className="form-control"
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                          placeholder="hero, homepage, banner"
                          disabled={isUploading}
                        />
                        <div className="form-text">
                          Comma-separated tags for organization
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="mt-4">
                      <div className="progress">
                        <div
                          className="progress-bar progress-bar-striped progress-bar-animated"
                          role="progressbar"
                          style={{ width: `${uploadProgress}%` }}
                        >
                          {uploadProgress}%
                        </div>
                      </div>
                      <p className="text-center text-muted mt-2">
                        Uploading...
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={isUploading}
              >
                Cancel
              </button>
              {selectedFile && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleUpload}
                  disabled={isUploading || !altText.trim()}
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
