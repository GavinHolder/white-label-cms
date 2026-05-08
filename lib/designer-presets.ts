// All 7 Flexible Designer preset definitions.
// Each preset is a complete designerData JSON object — apply by injecting into a FLEXIBLE section.

export interface SectionPreset {
  id: string;
  name: string;
  description: string;
  thumbnailId: string; // CSS class for wireframe thumbnail
  designerData: object; // JSON-serialisable designerData value
}

const mkId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

export const DESIGNER_PRESETS: SectionPreset[] = [
  // ─── 1. About Grid ──────────────────────────────────────────────────────────
  {
    id: "about-grid",
    name: "About Grid",
    description: "Tall photo left, company story + four stats on the right.",
    thumbnailId: "preset-thumb-about-grid",
    designerData: {
      layoutType: "grid",
      grid: { rows: 4, cols: 4, gap: 32 },
      blocks: [
        {
          id: mkId("img"),
          type: "image",
          position: { row: 1, col: 1, colSpan: 2, rowSpan: 4, section: 0 },
          props: { src: "", alt: "About us", objectFit: "cover" },
          subElements: [],
        },
        {
          id: mkId("txt"),
          type: "text",
          position: { row: 1, col: 3, colSpan: 2, rowSpan: 1, section: 0 },
          props: {},
          subElements: [
            { id: mkId("e"), type: "heading", props: { text: "OUR STORY", fontSize: 11, fontWeight: "700", color: "#22c55e", textTransform: "uppercase", letterSpacing: 2 } },
            { id: mkId("e"), type: "heading", props: { text: "Built for the Region.", fontSize: 40, fontWeight: "800", lineHeight: 1.1 } },
          ],
        },
        {
          id: mkId("txt"),
          type: "text",
          position: { row: 2, col: 3, colSpan: 2, rowSpan: 1, section: 0 },
          props: {},
          subElements: [
            { id: mkId("e"), type: "paragraph", props: { text: "We've been delivering quality products and services to our community for over two decades. Our commitment to excellence drives everything we do.", fontSize: 15 } },
            { id: mkId("e"), type: "paragraph", props: { text: "Every project is an opportunity to make a difference — on time, on spec, and built to last.", fontSize: 15 } },
          ],
        },
        {
          id: mkId("stat"),
          type: "stats",
          position: { row: 3, col: 3, colSpan: 1, rowSpan: 1, section: 0 },
          props: { number: "23", statLabel: "Years Experience" },
          subElements: [],
        },
        {
          id: mkId("stat"),
          type: "stats",
          position: { row: 3, col: 4, colSpan: 1, rowSpan: 1, section: 0 },
          props: { number: "500+", statLabel: "Projects Completed" },
          subElements: [],
        },
        {
          id: mkId("stat"),
          type: "stats",
          position: { row: 4, col: 3, colSpan: 1, rowSpan: 1, section: 0 },
          props: { number: "4", statLabel: "Regional Plants" },
          subElements: [],
        },
        {
          id: mkId("stat"),
          type: "stats",
          position: { row: 4, col: 4, colSpan: 1, rowSpan: 1, section: 0 },
          props: { number: "24hr", statLabel: "Quote Turnaround" },
          subElements: [],
        },
      ],
    },
  },

  // ─── 2. Services Grid ───────────────────────────────────────────────────────
  {
    id: "services-grid",
    name: "Services Grid",
    description: "Centred heading + three service cards in a row.",
    thumbnailId: "preset-thumb-services-grid",
    designerData: {
      layoutType: "grid",
      grid: { rows: 2, cols: 3, gap: 24 },
      blocks: [
        {
          id: mkId("txt"),
          type: "text",
          position: { row: 1, col: 1, colSpan: 3, rowSpan: 1, section: 0 },
          props: { textAlign: "center" },
          subElements: [
            { id: mkId("e"), type: "heading", props: { text: "WHAT WE OFFER", fontSize: 11, fontWeight: "700", color: "#22c55e", textTransform: "uppercase", letterSpacing: 2, textAlign: "center" } },
            { id: mkId("e"), type: "heading", props: { text: "Our Services", fontSize: 36, fontWeight: "800", textAlign: "center" } },
            { id: mkId("e"), type: "paragraph", props: { text: "Everything you need, all in one place.", fontSize: 16, textAlign: "center", maxWidth: 560 } },
          ],
        },
        {
          id: mkId("card"),
          type: "card",
          position: { row: 2, col: 1, colSpan: 1, rowSpan: 1, section: 0 },
          props: {},
          subElements: [
            { id: mkId("e"), type: "icon", props: { iconName: "bi-lightning-charge-fill", size: 40, color: "#22c55e" } },
            { id: mkId("e"), type: "heading", props: { text: "Fast Delivery", fontSize: 18, fontWeight: "700" } },
            { id: mkId("e"), type: "paragraph", props: { text: "We deliver quickly and reliably to keep your project on schedule.", fontSize: 14 } },
          ],
        },
        {
          id: mkId("card"),
          type: "card",
          position: { row: 2, col: 2, colSpan: 1, rowSpan: 1, section: 0 },
          props: {},
          subElements: [
            { id: mkId("e"), type: "icon", props: { iconName: "bi-shield-check-fill", size: 40, color: "#22c55e" } },
            { id: mkId("e"), type: "heading", props: { text: "Quality Guaranteed", fontSize: 18, fontWeight: "700" } },
            { id: mkId("e"), type: "paragraph", props: { text: "Our products meet the highest industry standards every single time.", fontSize: 14 } },
          ],
        },
        {
          id: mkId("card"),
          type: "card",
          position: { row: 2, col: 3, colSpan: 1, rowSpan: 1, section: 0 },
          props: {},
          subElements: [
            { id: mkId("e"), type: "icon", props: { iconName: "bi-headset", size: 40, color: "#22c55e" } },
            { id: mkId("e"), type: "heading", props: { text: "Expert Support", fontSize: 18, fontWeight: "700" } },
            { id: mkId("e"), type: "paragraph", props: { text: "Our team is on hand to answer questions and solve problems fast.", fontSize: 14 } },
          ],
        },
      ],
    },
  },

  // ─── 3. How It Works ────────────────────────────────────────────────────────
  {
    id: "how-it-works",
    name: "How It Works",
    description: "Numbered step cards in a horizontal row with connector lines.",
    thumbnailId: "preset-thumb-how-it-works",
    designerData: {
      layoutType: "grid",
      grid: { rows: 2, cols: 4, gap: 24 },
      blocks: [
        {
          id: mkId("txt"),
          type: "text",
          position: { row: 1, col: 1, colSpan: 4, rowSpan: 1, section: 0 },
          props: { textAlign: "center" },
          subElements: [
            { id: mkId("e"), type: "heading", props: { text: "THE PROCESS", fontSize: 11, fontWeight: "700", color: "#22c55e", textTransform: "uppercase", letterSpacing: 2, textAlign: "center" } },
            { id: mkId("e"), type: "heading", props: { text: "How It Works", fontSize: 36, fontWeight: "800", textAlign: "center" } },
            { id: mkId("e"), type: "paragraph", props: { text: "Simple steps, outstanding results.", fontSize: 16, textAlign: "center", maxWidth: 500 } },
          ],
        },
        {
          id: mkId("step"),
          type: "how-steps",
          position: { row: 2, col: 1, colSpan: 1, rowSpan: 1, section: 0 },
          props: { stepNumber: "01", title: "Get in Touch", description: "Reach out via our contact form or call us directly to discuss your requirements.", isLast: false },
          subElements: [],
        },
        {
          id: mkId("step"),
          type: "how-steps",
          position: { row: 2, col: 2, colSpan: 1, rowSpan: 1, section: 0 },
          props: { stepNumber: "02", title: "Receive a Quote", description: "We'll assess your needs and provide a detailed quote within 24 hours.", isLast: false },
          subElements: [],
        },
        {
          id: mkId("step"),
          type: "how-steps",
          position: { row: 2, col: 3, colSpan: 1, rowSpan: 1, section: 0 },
          props: { stepNumber: "03", title: "Confirm & Schedule", description: "Approve the quote and we'll lock in your delivery or service date.", isLast: false },
          subElements: [],
        },
        {
          id: mkId("step"),
          type: "how-steps",
          position: { row: 2, col: 4, colSpan: 1, rowSpan: 1, section: 0 },
          props: { stepNumber: "04", title: "Delivery & Done", description: "We deliver on time and follow up to make sure everything is perfect.", isLast: true },
          subElements: [],
        },
      ],
    },
  },

  // ─── 4. Contact Split ───────────────────────────────────────────────────────
  {
    id: "contact-split",
    name: "Contact Split",
    description: "Contact details on the left, contact form on the right.",
    thumbnailId: "preset-thumb-contact-split",
    designerData: {
      layoutType: "grid",
      grid: { rows: 1, cols: 2, gap: 48 },
      blocks: [
        {
          id: mkId("txt"),
          type: "text",
          position: { row: 1, col: 1, colSpan: 1, rowSpan: 1, section: 0 },
          props: {},
          subElements: [
            { id: mkId("e"), type: "heading", props: { text: "GET IN TOUCH", fontSize: 11, fontWeight: "700", color: "#22c55e", textTransform: "uppercase", letterSpacing: 2 } },
            { id: mkId("e"), type: "heading", props: { text: "Let's Talk", fontSize: 36, fontWeight: "800" } },
            { id: mkId("e"), type: "paragraph", props: { text: "Have a question or want to place an order? We'd love to hear from you. Fill in the form and we'll get back to you within one business day.", fontSize: 15 } },
            { id: mkId("e"), type: "paragraph", props: { text: "📞  +27 (0)00 000 0000", fontSize: 14, fontWeight: "600" } },
            { id: mkId("e"), type: "paragraph", props: { text: "✉  info@yourcompany.co.za", fontSize: 14, fontWeight: "600" } },
            { id: mkId("e"), type: "paragraph", props: { text: "📍  123 Main Street, Your Town, 0000", fontSize: 14 } },
          ],
        },
        {
          id: mkId("form"),
          type: "contact-form",
          position: { row: 1, col: 2, colSpan: 1, rowSpan: 1, section: 0 },
          props: {
            formTitle: "Send Us a Message",
            fields: { name: true, email: true, phone: false, message: true, subject: false },
            submitLabel: "Send Message",
            successMessage: "Thank you! We'll be in touch shortly.",
          },
          subElements: [],
        },
      ],
    },
  },

  // ─── 5. Stats Banner ────────────────────────────────────────────────────────
  {
    id: "stats-banner",
    name: "Stats Banner",
    description: "Four bold stats side by side — ideal as a social-proof band.",
    thumbnailId: "preset-thumb-stats-banner",
    designerData: {
      layoutType: "grid",
      grid: { rows: 1, cols: 4, gap: 1 },
      blocks: [
        {
          id: mkId("stat"),
          type: "stats",
          position: { row: 1, col: 1, colSpan: 1, rowSpan: 1, section: 0 },
          props: { number: "500+", statLabel: "Projects Delivered" },
          subElements: [],
        },
        {
          id: mkId("stat"),
          type: "stats",
          position: { row: 1, col: 2, colSpan: 1, rowSpan: 1, section: 0 },
          props: { number: "23", statLabel: "Years in Business" },
          subElements: [],
        },
        {
          id: mkId("stat"),
          type: "stats",
          position: { row: 1, col: 3, colSpan: 1, rowSpan: 1, section: 0 },
          props: { number: "98%", statLabel: "Client Satisfaction" },
          subElements: [],
        },
        {
          id: mkId("stat"),
          type: "stats",
          position: { row: 1, col: 4, colSpan: 1, rowSpan: 1, section: 0 },
          props: { number: "24hr", statLabel: "Quote Turnaround" },
          subElements: [],
        },
      ],
    },
  },

  // ─── 6. Features Alternating ────────────────────────────────────────────────
  {
    id: "features-alternating",
    name: "Features Alternating",
    description: "Section heading + alternating text/image rows for feature details.",
    thumbnailId: "preset-thumb-features-alternating",
    designerData: {
      layoutType: "grid",
      grid: { rows: 3, cols: 2, gap: 48 },
      blocks: [
        {
          id: mkId("txt"),
          type: "text",
          position: { row: 1, col: 1, colSpan: 2, rowSpan: 1, section: 0 },
          props: { textAlign: "center" },
          subElements: [
            { id: mkId("e"), type: "heading", props: { text: "WHAT SETS US APART", fontSize: 11, fontWeight: "700", color: "#22c55e", textTransform: "uppercase", letterSpacing: 2, textAlign: "center" } },
            { id: mkId("e"), type: "heading", props: { text: "Why Choose Us", fontSize: 36, fontWeight: "800", textAlign: "center" } },
          ],
        },
        {
          id: mkId("txt"),
          type: "text",
          position: { row: 2, col: 1, colSpan: 1, rowSpan: 1, section: 0 },
          props: {},
          subElements: [
            { id: mkId("e"), type: "heading", props: { text: "FEATURE ONE", fontSize: 11, fontWeight: "700", color: "#22c55e", textTransform: "uppercase", letterSpacing: 2 } },
            { id: mkId("e"), type: "heading", props: { text: "Precision & Reliability", fontSize: 28, fontWeight: "800" } },
            { id: mkId("e"), type: "paragraph", props: { text: "We take precision seriously. Every product is tested and verified before it leaves our facility to ensure it meets specification.", fontSize: 15 } },
            { id: mkId("e"), type: "button", props: { text: "Learn More", navTarget: "#contact", bgColor: "#22c55e", textColor: "#fff" } },
          ],
        },
        {
          id: mkId("img"),
          type: "image",
          position: { row: 2, col: 2, colSpan: 1, rowSpan: 1, section: 0 },
          props: { src: "", alt: "Feature one", objectFit: "cover" },
          subElements: [],
        },
        {
          id: mkId("img"),
          type: "image",
          position: { row: 3, col: 1, colSpan: 1, rowSpan: 1, section: 0 },
          props: { src: "", alt: "Feature two", objectFit: "cover" },
          subElements: [],
        },
        {
          id: mkId("txt"),
          type: "text",
          position: { row: 3, col: 2, colSpan: 1, rowSpan: 1, section: 0 },
          props: {},
          subElements: [
            { id: mkId("e"), type: "heading", props: { text: "FEATURE TWO", fontSize: 11, fontWeight: "700", color: "#22c55e", textTransform: "uppercase", letterSpacing: 2 } },
            { id: mkId("e"), type: "heading", props: { text: "Speed You Can Count On", fontSize: 28, fontWeight: "800" } },
            { id: mkId("e"), type: "paragraph", props: { text: "Fast turnaround without compromising quality. We operate seven days a week so your schedule is never held up by ours.", fontSize: 15 } },
            { id: mkId("e"), type: "button", props: { text: "Get a Quote", navTarget: "#contact", bgColor: "#22c55e", textColor: "#fff" } },
          ],
        },
      ],
    },
  },

  // ─── 7. Team Grid ───────────────────────────────────────────────────────────
  {
    id: "team-grid",
    name: "Team Grid",
    description: "Section heading + four team member cards with photo, name, and role.",
    thumbnailId: "preset-thumb-team-grid",
    designerData: {
      layoutType: "grid",
      grid: { rows: 2, cols: 4, gap: 16 },
      blocks: [
        {
          id: mkId("txt"),
          type: "text",
          position: { row: 1, col: 1, colSpan: 4, rowSpan: 1, section: 0 },
          props: { textAlign: "center" },
          subElements: [
            { id: mkId("e"), type: "heading", props: { text: "OUR TEAM", fontSize: 11, fontWeight: "700", color: "#22c55e", textTransform: "uppercase", letterSpacing: 2, textAlign: "center" } },
            { id: mkId("e"), type: "heading", props: { text: "Meet the People Behind the Work", fontSize: 32, fontWeight: "800", textAlign: "center" } },
            { id: mkId("e"), type: "paragraph", props: { text: "Experienced, dedicated, and ready to help.", fontSize: 15, textAlign: "center" } },
          ],
        },
        {
          id: mkId("card"),
          type: "card",
          position: { row: 2, col: 1, colSpan: 1, rowSpan: 1, section: 0 },
          props: {},
          subElements: [
            { id: mkId("e"), type: "image", props: { src: "", alt: "Team member", elRadius: 8 } },
            { id: mkId("e"), type: "heading", props: { text: "Jane Smith", fontSize: 16, fontWeight: "700" } },
            { id: mkId("e"), type: "paragraph", props: { text: "Operations Manager", fontSize: 13, color: "#6c757d" } },
          ],
        },
        {
          id: mkId("card"),
          type: "card",
          position: { row: 2, col: 2, colSpan: 1, rowSpan: 1, section: 0 },
          props: {},
          subElements: [
            { id: mkId("e"), type: "image", props: { src: "", alt: "Team member", elRadius: 8 } },
            { id: mkId("e"), type: "heading", props: { text: "John Doe", fontSize: 16, fontWeight: "700" } },
            { id: mkId("e"), type: "paragraph", props: { text: "Lead Engineer", fontSize: 13, color: "#6c757d" } },
          ],
        },
        {
          id: mkId("card"),
          type: "card",
          position: { row: 2, col: 3, colSpan: 1, rowSpan: 1, section: 0 },
          props: {},
          subElements: [
            { id: mkId("e"), type: "image", props: { src: "", alt: "Team member", elRadius: 8 } },
            { id: mkId("e"), type: "heading", props: { text: "Sarah Lee", fontSize: 16, fontWeight: "700" } },
            { id: mkId("e"), type: "paragraph", props: { text: "Client Relations", fontSize: 13, color: "#6c757d" } },
          ],
        },
        {
          id: mkId("card"),
          type: "card",
          position: { row: 2, col: 4, colSpan: 1, rowSpan: 1, section: 0 },
          props: {},
          subElements: [
            { id: mkId("e"), type: "image", props: { src: "", alt: "Team member", elRadius: 8 } },
            { id: mkId("e"), type: "heading", props: { text: "Mike Brown", fontSize: 16, fontWeight: "700" } },
            { id: mkId("e"), type: "paragraph", props: { text: "Site Supervisor", fontSize: 13, color: "#6c757d" } },
          ],
        },
      ],
    },
  },
];
