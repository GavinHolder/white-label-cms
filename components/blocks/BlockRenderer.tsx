import type { ContentBlock } from "@/types/section-v2";
import TextImageBlock from "./TextImageBlock";
import StatsGridBlock from "./StatsGridBlock";
import CardGridBlock from "./CardGridBlock";
import BannerBlock from "./BannerBlock";
import TableBlock from "./TableBlock";

/**
 * Block Renderer
 *
 * Routes a content block to the correct component based on its type.
 * Acts as the bridge between section layout and individual block components.
 */

interface BlockRendererProps {
  block: ContentBlock;
}

export default function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.type) {
    case "text-image":
      return <TextImageBlock block={block} />;

    case "stats-grid":
      return <StatsGridBlock block={block} />;

    case "card-grid":
      return <CardGridBlock block={block} />;

    case "banner":
      return <BannerBlock block={block} />;

    case "table":
      return <TableBlock block={block} />;

    default: {
      const exhaustiveCheck: never = block;
      console.warn(
        `Unknown block type: ${(exhaustiveCheck as ContentBlock).type}`
      );
      return null;
    }
  }
}
