"use client";

import type { ContentBlockType } from "@/types/section-v2";
import { blockTypeInfo } from "@/lib/section-data-v2";

/**
 * BlockPalette Component
 *
 * Displays available content block types that can be added to a section.
 * Each block type shows an icon, name, and description.
 */

interface BlockPaletteProps {
  onAddBlock: (type: ContentBlockType) => void;
}

const BLOCK_TYPES: ContentBlockType[] = [
  "text-image",
  "stats-grid",
  "card-grid",
  "banner",
  "table",
];

export default function BlockPalette({ onAddBlock }: BlockPaletteProps) {
  return (
    <div>
      <label className="form-label fw-semibold small mb-2">
        Add Content Block
      </label>
      <div className="d-flex flex-wrap gap-2">
        {BLOCK_TYPES.map((type) => {
          const info = blockTypeInfo[type];
          return (
            <button
              key={type}
              type="button"
              className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
              onClick={() => onAddBlock(type)}
              title={info.description}
            >
              <i className={info.icon} />
              <span>{info.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
