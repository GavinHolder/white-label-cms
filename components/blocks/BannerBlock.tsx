import DOMPurify from "isomorphic-dompurify";
import Banner from "@/components/ui/Banner";
import type { BannerBlock as BannerBlockType } from "@/types/section-v2";

/**
 * Banner Content Block
 *
 * Alert/notification banner with variant styling.
 * Stripped of section wrapper — renders ONLY content for use inside sections.
 */

interface BannerBlockProps {
  block: BannerBlockType;
}

export default function BannerBlock({ block }: BannerBlockProps) {
  const { content, variant } = block;

  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li"],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });

  return (
    <div className="w-100">
      <Banner variant={variant}>
        <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
      </Banner>
    </div>
  );
}
