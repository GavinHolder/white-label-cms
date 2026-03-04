"use client";

import { useState } from "react";
import SpacingControls from "./SpacingControls";

interface SectionSpacingEditorProps {
  sectionId: string;
  sectionName: string;
  initialSpacing?: {
    paddingTop?: number;
    paddingBottom?: number;
    snapThreshold?: number;
  };
  onSave: (spacing: { paddingTop: number; paddingBottom: number; snapThreshold: number }) => Promise<void>;
  onClose: () => void;
}

export default function SectionSpacingEditor({
  sectionId,
  sectionName,
  initialSpacing,
  onSave,
  onClose,
}: SectionSpacingEditorProps) {
  // Minimum top padding to ensure content isn't hidden behind navbar
  const MIN_TOP_PADDING = 100;

  const [paddingTop, setPaddingTop] = useState(
    Math.max(initialSpacing?.paddingTop || 100, MIN_TOP_PADDING)
  );
  const [paddingBottom, setPaddingBottom] = useState(initialSpacing?.paddingBottom || 80);
  const [snapThreshold, setSnapThreshold] = useState(initialSpacing?.snapThreshold || 100);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage("");

    try {
      await onSave({ paddingTop, paddingBottom, snapThreshold });
    } catch (error) {
      console.error("Failed to save spacing:", error);
      setErrorMessage("Failed to save spacing. Please try again.");
      setIsSaving(false);
    }
  };

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
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title">Section Spacing - {sectionName}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={isSaving}
                aria-label="Close"
              />
            </div>

            {/* Body */}
            <div className="modal-body">
              {/* Info Alert */}
              <div className="alert alert-info mb-4">
                <strong>💡 Spacing Control:</strong>
                <p className="mb-0 mt-2">
                  Adjust the internal padding (space) at the top and bottom of this section.
                  All spacing is controlled inside the section - no external margins are applied.
                  This gives you pixel-level control over section spacing.
                </p>
                <p className="mb-0 mt-2">
                  <strong>Note:</strong> Top padding has a minimum of {MIN_TOP_PADDING}px to ensure
                  content isn't hidden behind the fixed navbar.
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="alert alert-danger">
                  <strong>Error:</strong> {errorMessage}
                </div>
              )}

              {/* Spacing Controls */}
              <SpacingControls
                paddingTop={paddingTop}
                paddingBottom={paddingBottom}
                onPaddingTopChange={(value) => setPaddingTop(Math.max(value, MIN_TOP_PADDING))}
                onPaddingBottomChange={setPaddingBottom}
                minTop={MIN_TOP_PADDING} // Top padding minimum enforced for navbar clearance
                minBottom={0} // Bottom padding can be 0
                max={200}
                step={5}
              />

              {/* Snap threshold is controlled globally via Admin > Settings page */}

              {/* Visual Preview */}
              <div className="mt-4">
                <h6>Visual Preview:</h6>
                <div className="border rounded p-3 bg-light">
                  <div
                    className="bg-white border rounded shadow-sm"
                    style={{
                      paddingTop: `${paddingTop}px`,
                      paddingBottom: `${paddingBottom}px`,
                      paddingLeft: "20px",
                      paddingRight: "20px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div className="text-center text-muted">
                      <div className="small mb-2" style={{ opacity: 0.6 }}>
                        ↑ {paddingTop}px padding top ↑
                      </div>
                      <div className="py-3 border-top border-bottom">
                        Section Content Area
                      </div>
                      <div className="small mt-2" style={{ opacity: 0.6 }}>
                        ↓ {paddingBottom}px padding bottom ↓
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  "Save Spacing"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
