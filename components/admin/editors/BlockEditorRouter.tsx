"use client";

import type { ContentBlock } from "@/types/section-v2";
import TextImageBlockEditor from "./TextImageBlockEditor";
import StatsGridBlockEditor from "./StatsGridBlockEditor";
import CardGridBlockEditor from "./CardGridBlockEditor";
import BannerBlockEditor from "./BannerBlockEditor";
import TableBlockEditor from "./TableBlockEditor";

/**
 * BlockEditorRouter Component
 *
 * Routes a content block to the correct editor based on its type.
 * Each editor receives the typed block data and an onChange callback.
 */

interface BlockEditorRouterProps {
  block: ContentBlock;
  onChange: (updates: Partial<ContentBlock>) => void;
}

export default function BlockEditorRouter({
  block,
  onChange,
}: BlockEditorRouterProps) {
  switch (block.type) {
    case "text-image":
      return <TextImageBlockEditor block={block} onChange={onChange} />;

    case "stats-grid":
      return <StatsGridBlockEditor block={block} onChange={onChange} />;

    case "card-grid":
      return <CardGridBlockEditor block={block} onChange={onChange} />;

    case "banner":
      return <BannerBlockEditor block={block} onChange={onChange} />;

    case "table":
      return <TableBlockEditor block={block} onChange={onChange} />;

    default: {
      const exhaustiveCheck: never = block;
      return (
        <div className="alert alert-warning">
          Unknown block type: {(exhaustiveCheck as ContentBlock).type}
        </div>
      );
    }
  }
}
