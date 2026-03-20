from pathlib import Path

PAGE_WIDTH = 612
PAGE_HEIGHT = 792
MARGIN = 34
GAP = 22
COLUMN_WIDTH = (PAGE_WIDTH - MARGIN * 2 - GAP) / 2
CONTENT_TOP = 112
FOOTER_TOP = 758
MAX_COLUMN_BOTTOM = 736

COLORS = {
    "ink": (0.11, 0.14, 0.20),
    "muted": (0.35, 0.39, 0.48),
    "slate": (0.90, 0.93, 0.97),
    "blue": (0.19, 0.38, 0.67),
    "teal": (0.09, 0.54, 0.56),
    "gold": (0.85, 0.64, 0.16),
    "rose": (0.73, 0.31, 0.36),
    "green": (0.20, 0.55, 0.32),
}

LEFT_SECTIONS = [
    {
        "title": "What It Is",
        "accent": "blue",
        "blocks": [
            {
                "type": "paragraph",
                "text": (
                    "nhoti is a dual-sided Next.js app that connects SME digital projects "
                    "with students for short, real-world work. It combines AI-assisted brief "
                    "creation, profile/project matching, and an execution workflow from "
                    "application through deliverable review."
                ),
            }
        ],
    },
    {
        "title": "Who It's For",
        "accent": "teal",
        "blocks": [
            {
                "type": "paragraph",
                "text": (
                    "Primary persona: an SME owner or manager who needs fast help on small "
                    "digitalization tasks but may not have a clean technical brief. Secondary "
                    "persona: university students building portfolio-ready experience through "
                    "real company work."
                ),
            }
        ],
    },
    {
        "title": "What It Does",
        "accent": "gold",
        "blocks": [
            {
                "type": "bullets",
                "items": [
                    "Role-based signup and login for SMEs and students.",
                    "AI chat wizard turns rough SME ideas into structured project fields.",
                    "AI brief standardization and embedding generation for projects and profiles.",
                    "Student profile management for skills, tech stack, links, and interests.",
                    "AI-ranked project recommendations, candidate suggestions, and SME search.",
                    "Apply/invite, accept/reject, and project lifecycle status tracking.",
                    "Milestones, progress updates, deliverable link submission, and post-project ratings.",
                ],
            }
        ],
    },
]

RIGHT_SECTIONS = [
    {
        "title": "How It Works",
        "accent": "rose",
        "blocks": [
            {
                "type": "paragraph",
                "text": (
                    "UI: Next.js 14 App Router pages and client components, styled with "
                    "Tailwind/shadcn; interactive forms use react-hook-form and some screens "
                    "use React Query."
                ),
            },
            {
                "type": "paragraph",
                "text": (
                    "Auth and app logic: NextAuth credentials + bcrypt, with middleware "
                    "gating /sme/* and /student/* routes; server actions and API routes "
                    "handle projects, applications, progress, and evaluations."
                ),
            },
            {
                "type": "paragraph",
                "text": (
                    "Data and AI: Prisma writes to PostgreSQL models for users, profiles, "
                    "projects, applications, project progress, and evaluations. "
                    "OpenAI/OpenRouter routes standardize briefs, power the brief chat flow, "
                    "and generate embeddings."
                ),
            },
            {
                "type": "paragraph",
                "text": (
                    "Data flow: Browser -> pages/forms -> API routes or server actions -> "
                    "Prisma -> PostgreSQL; AI calls return briefs and embeddings that feed "
                    "matching and dashboard ranking."
                ),
            },
            {
                "type": "paragraph",
                "text": (
                    "Background jobs, queues, analytics, and file/object storage: Not found "
                    "in repo. Deliverables are stored as external URLs, not uploaded files."
                ),
            },
        ],
    },
    {
        "title": "How To Run",
        "accent": "green",
        "blocks": [
            {
                "type": "numbered",
                "items": [
                    "Use Node 20.x; copy .env.example to .env and fill AUTH_SECRET and NEXTAUTH_SECRET. Add OPENAI_* to enable AI features.",
                    "Run npm install.",
                    "Run npm run db:up.",
                    "Run npm run db:push.",
                    "Run npm run dev and open http://localhost:3000.",
                ],
            }
        ],
    },
]


def pdf_escape(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def rgb(color):
    return f"{color[0]} {color[1]} {color[2]}"


def estimate_width(text: str, font_size: float, mono: bool = False) -> float:
    units = 0.0
    for char in text:
        if char == " ":
            units += 0.60 if mono else 0.28
        elif char.isupper():
            units += 0.60 if mono else 0.62
        elif char.islower() or char.isdigit():
            units += 0.60 if mono else 0.53
        else:
            units += 0.60 if mono else 0.32
    return units * font_size


def wrap_text(text: str, max_width: float, font_size: float, mono: bool = False):
    words = [word for word in text.strip().split() if word]
    lines = []
    current = ""

    for word in words:
      candidate = f"{current} {word}".strip()
      if not current or estimate_width(candidate, font_size, mono) <= max_width:
          current = candidate
      else:
          lines.append(current)
          current = word

    if current:
        lines.append(current)

    return lines


def draw_rect(commands, x, y_top, width, height, fill_color):
    bottom = PAGE_HEIGHT - y_top - height
    commands.append(f"{rgb(fill_color)} rg")
    commands.append(f"{x:.2f} {bottom:.2f} {width:.2f} {height:.2f} re f")


def draw_line(commands, x1, y_top1, x2, y_top2, stroke_color, width=1.0):
    y1 = PAGE_HEIGHT - y_top1
    y2 = PAGE_HEIGHT - y_top2
    commands.append(f"{rgb(stroke_color)} RG")
    commands.append(f"{width:.2f} w")
    commands.append(f"{x1:.2f} {y1:.2f} m {x2:.2f} {y2:.2f} l S")


def draw_text(commands, x, y_top, text, font="F1", size=10.0, color=COLORS["ink"]):
    baseline = PAGE_HEIGHT - y_top - size
    commands.append("BT")
    commands.append(f"/{font} {size:.2f} Tf")
    commands.append(f"{rgb(color)} rg")
    commands.append(f"{x:.2f} {baseline:.2f} Td")
    commands.append(f"({pdf_escape(text)}) Tj")
    commands.append("ET")


def layout_section(section, width, body_font):
    title_height = 20
    line_gap = body_font * 1.35
    height = title_height + 10

    for block in section["blocks"]:
        if block["type"] == "paragraph":
            lines = wrap_text(block["text"], width, body_font)
            height += len(lines) * line_gap + 6
        elif block["type"] == "bullets":
            for item in block["items"]:
                lines = wrap_text(item, width - 14, body_font)
                height += len(lines) * line_gap + 2
            height += 4
        elif block["type"] == "numbered":
            for index, item in enumerate(block["items"], start=1):
                marker = f"{index}."
                marker_width = estimate_width(marker, body_font)
                lines = wrap_text(item, width - marker_width - 10, body_font)
                height += len(lines) * line_gap + 2
            height += 4

    return height + 6


def render_section(commands, section, x, y_top, width, body_font, title_font):
    draw_rect(commands, x, y_top, width, 20, COLORS[section["accent"]])
    draw_text(commands, x + 10, y_top + 3, section["title"], font="F2", size=title_font, color=(1, 1, 1))

    cursor = y_top + 31
    line_gap = body_font * 1.35

    for block in section["blocks"]:
        if block["type"] == "paragraph":
            for line in wrap_text(block["text"], width, body_font):
                draw_text(commands, x, cursor, line, size=body_font)
                cursor += line_gap
            cursor += 6
            continue

        if block["type"] == "bullets":
            for item in block["items"]:
                lines = wrap_text(item, width - 14, body_font)
                for line_index, line in enumerate(lines):
                    if line_index == 0:
                        draw_text(commands, x, cursor, f"- {line}", size=body_font)
                    else:
                        draw_text(commands, x + 9, cursor, line, size=body_font)
                    cursor += line_gap
                cursor += 2
            cursor += 4
            continue

        if block["type"] == "numbered":
            for index, item in enumerate(block["items"], start=1):
                marker = f"{index}."
                marker_width = estimate_width(marker, body_font)
                lines = wrap_text(item, width - marker_width - 10, body_font)
                for line_index, line in enumerate(lines):
                    if line_index == 0:
                        draw_text(commands, x, cursor, marker, size=body_font)
                    draw_text(commands, x + marker_width + 8, cursor, line, size=body_font)
                    cursor += line_gap
                cursor += 2
            cursor += 4

    return cursor + 2


def measure_column_height(sections, width, body_font):
    cursor = CONTENT_TOP
    for section in sections:
        cursor += layout_section(section, width, body_font) + 8
    return cursor


def build_pdf():
    body_font = 9.2
    title_font = 10.1

    while body_font >= 8.0:
        left_height = measure_column_height(LEFT_SECTIONS, COLUMN_WIDTH, body_font)
        right_height = measure_column_height(RIGHT_SECTIONS, COLUMN_WIDTH, body_font)
        if left_height <= MAX_COLUMN_BOTTOM and right_height <= MAX_COLUMN_BOTTOM:
            break
        body_font -= 0.2
        title_font -= 0.1

    commands = []

    draw_rect(commands, MARGIN, 28, PAGE_WIDTH - MARGIN * 2, 58, COLORS["slate"])
    draw_rect(commands, MARGIN, 28, 10, 58, COLORS["blue"])
    draw_text(commands, MARGIN + 18, 38, "nhoti", font="F2", size=24)
    draw_text(commands, MARGIN + 18, 66, "One-Page App Summary", font="F2", size=11, color=COLORS["blue"])
    draw_text(
        commands,
        MARGIN + 170,
        67,
        "Repo-evidence summary | Generated 2026-03-19",
        size=9.2,
        color=COLORS["muted"],
    )
    draw_text(
        commands,
        PAGE_WIDTH - MARGIN - 172,
        44,
        "AI-enabled SME <> student workflow platform",
        size=9.1,
        color=COLORS["muted"],
    )

    draw_line(commands, MARGIN, 98, PAGE_WIDTH - MARGIN, 98, COLORS["slate"], 1.2)

    left_x = MARGIN
    left_cursor = CONTENT_TOP
    for section in LEFT_SECTIONS:
        left_cursor = render_section(commands, section, left_x, left_cursor, COLUMN_WIDTH, body_font, title_font) + 8

    right_x = MARGIN + COLUMN_WIDTH + GAP
    right_cursor = CONTENT_TOP
    for section in RIGHT_SECTIONS:
        right_cursor = render_section(commands, section, right_x, right_cursor, COLUMN_WIDTH, body_font, title_font) + 8

    draw_line(commands, MARGIN, FOOTER_TOP - 6, PAGE_WIDTH - MARGIN, FOOTER_TOP - 6, COLORS["slate"], 1.0)
    draw_text(
        commands,
        MARGIN,
        FOOTER_TOP,
        "Evidence: README, .env.example, Prisma schema, auth/openai libs, dashboard pages, server actions, and API routes.",
        size=8.0,
        color=COLORS["muted"],
    )

    stream = "\n".join(commands)
    stream_bytes = stream.encode("latin-1", "replace")
    objects = [
        b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj",
        b"2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj",
        (
            f"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {PAGE_WIDTH} {PAGE_HEIGHT}] "
            "/Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R >> >> /Contents 4 0 R >>\nendobj"
        ).encode("latin-1"),
        f"4 0 obj\n<< /Length {len(stream_bytes)} >>\nstream\n".encode("latin-1") + stream_bytes + b"\nendstream\nendobj",
        b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj",
        b"6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj",
        b"7 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj",
    ]

    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]

    for obj in objects:
        offsets.append(len(pdf))
        pdf.extend(obj)
        pdf.extend(b"\n")

    xref_offset = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode("latin-1"))
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode("latin-1"))
    pdf.extend(f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode("latin-1"))
    return bytes(pdf)


def main():
    root = Path.cwd()
    output_dir = root / "exports"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "nhoti-app-summary.pdf"
    output_path.write_bytes(build_pdf())
    print(output_path)


if __name__ == "__main__":
    main()
