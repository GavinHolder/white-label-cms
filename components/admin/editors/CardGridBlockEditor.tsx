"use client";

import type { CardGridBlock, ContentBlock, ButtonConfig } from "@/types/section-v2";

/**
 * CardGridBlockEditor
 *
 * Admin editor for the Card Grid content block.
 * Allows editing heading, subheading, column count, and individual cards.
 */

interface CardGridBlockEditorProps {
  block: CardGridBlock;
  onChange: (updates: Partial<ContentBlock>) => void;
}

export default function CardGridBlockEditor({
  block,
  onChange,
}: CardGridBlockEditorProps) {
  const updateCard = (
    index: number,
    field: string,
    value: string | ButtonConfig[]
  ) => {
    const updatedCards = [...block.cards];
    updatedCards[index] = { ...updatedCards[index], [field]: value };
    onChange({ cards: updatedCards });
  };

  const addCard = () => {
    const newCard = {
      id: `card-${Date.now()}`,
      title: "New Card",
      description: "Card description",
    };
    onChange({ cards: [...block.cards, newCard] });
  };

  const removeCard = (index: number) => {
    const updatedCards = block.cards.filter((_, i) => i !== index);
    onChange({ cards: updatedCards });
  };

  return (
    <div className="d-flex flex-column gap-3">
      <div>
        <label className="form-label small fw-semibold">Heading</label>
        <input
          type="text"
          className="form-control form-control-sm"
          value={block.heading || ""}
          onChange={(e) => onChange({ heading: e.target.value })}
        />
      </div>

      <div>
        <label className="form-label small fw-semibold">Subheading</label>
        <input
          type="text"
          className="form-control form-control-sm"
          value={block.subheading || ""}
          onChange={(e) => onChange({ subheading: e.target.value })}
        />
      </div>

      <div>
        <label className="form-label small fw-semibold">Columns</label>
        <select
          className="form-select form-select-sm"
          value={block.columns}
          onChange={(e) =>
            onChange({ columns: Number(e.target.value) as 2 | 3 | 4 })
          }
          style={{ maxWidth: "120px" }}
        >
          <option value={2}>2 Columns</option>
          <option value={3}>3 Columns</option>
          <option value={4}>4 Columns</option>
        </select>
      </div>

      {/* Cards List */}
      <div>
        <label className="form-label small fw-semibold">
          Cards ({block.cards.length})
        </label>
        {block.cards.map((card, index) => (
          <div
            key={card.id}
            className="card card-body p-2 mb-2 bg-light"
          >
            <div className="d-flex gap-2 mb-1">
              <input
                type="text"
                className="form-control form-control-sm flex-fill"
                value={card.title}
                onChange={(e) => updateCard(index, "title", e.target.value)}
                placeholder="Title"
              />
              <input
                type="text"
                className="form-control form-control-sm"
                value={card.badge || ""}
                onChange={(e) => updateCard(index, "badge", e.target.value)}
                placeholder="Badge"
                style={{ maxWidth: "100px" }}
              />
              <input
                type="color"
                className="form-control form-control-color"
                value={card.color || "#2563eb"}
                onChange={(e) => updateCard(index, "color", e.target.value)}
                style={{ width: "32px", height: "32px" }}
                title="Accent color"
              />
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => removeCard(index)}
              >
                <i className="bi-trash" />
              </button>
            </div>
            <textarea
              className="form-control form-control-sm"
              rows={3}
              value={card.description}
              onChange={(e) =>
                updateCard(index, "description", e.target.value)
              }
              placeholder="Description"
            />
          </div>
        ))}
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={addCard}
        >
          <i className="bi-plus me-1" />
          Add Card
        </button>
      </div>
    </div>
  );
}
