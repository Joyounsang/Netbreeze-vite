#!/usr/bin/env python3
import zipfile
import html
import re
import xml.etree.ElementTree as ET
from pathlib import Path

DOCX = Path("/Users/younsangjo/Downloads/서비스이용약관_플랫_v.2026.docx")
OUT = Path(__file__).resolve().parents[1] / "src/includes/l010102-terms-content.html"
NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


def para_text(p):
    parts = []
    for t in p.findall(".//w:t", NS):
        if t.text:
            parts.append(t.text)
        if t.tail:
            parts.append(t.tail)
    return "".join(parts)


def has_num(p):
    pPr = p.find("w:pPr", NS)
    return pPr is not None and pPr.find("w:numPr", NS) is not None


def esc(s):
    return html.escape(s.strip(), quote=False)


def h3(t):
    t = re.sub(r"\s+", " ", t)
    return f"<h3>{esc(t)}</h3>"


def p(t):
    t = re.sub(r"\s+", " ", t.strip())
    return f"<p>{esc(t)}</p>" if t else ""


def split_circled(text):
    parts = re.split(r"(?=②|③|④|⑤|⑥|⑦|⑧|⑨|⑩)", text)
    return [x.strip() for x in parts if x.strip()]


def split_article_header(text):
    m = re.match(r"^(제\d+조\s*\([^)]+\))(.*)$", text, re.S)
    if not m:
        return None, text
    return m.group(1).strip(), m.group(2).strip()


def format_numbered_clause(text):
    m = re.match(r"^(②.*?)(?=\d+\.)", text, re.S)
    if not m:
        return [p(text)]
    intro = m.group(1).strip()
    rest = text[len(m.group(1)) :]
    items = re.findall(r"\d+\.\s*.*?(?=\d+\.|$)", rest, re.S)
    out = [p(intro)]
    if items:
        out.append('<ol class="terms-ol">')
        for it in items:
            text_item = re.sub(r"^\d+\.\s*", "", it.strip())
            out.append(f"<li>{esc(text_item)}</li>")
        out.append("</ol>")
    else:
        out.append(p(rest))
    return out


def read_paras():
    with zipfile.ZipFile(DOCX) as z:
        root = ET.fromstring(z.read("word/document.xml"))
        paras = []
        for el in root.find("w:body", NS):
            if el.tag.split("}")[-1] != "p":
                continue
            t = para_text(el).strip()
            if t:
                paras.append((t, has_num(el)))
    return paras


def consume_num_list(paras, i):
    lines = []
    while i < len(paras) and paras[i][1]:
        lines.append(paras[i][0])
        i += 1
    return lines, i


def main():
    blocks = []
    paras = read_paras()
    i = 0
    pending_art2 = False
    pending_art7 = False

    while i < len(paras):
        text, is_num = paras[i]

        if is_num:
            items, i = consume_num_list(paras, i)
            blocks.append("<ul>")
            for it in items:
                blocks.append(f"<li>{esc(it)}</li>")
            blocks.append("</ul>")
            continue

        header, body = split_article_header(text)
        if header:
            blocks.append(h3(header))
            art_m = re.match(r"^(제\d+조)", header)
            art = art_m.group(1) if art_m else header

            if art == "제1조":
                blocks.append(p(body))
            elif art == "제2조":
                intro, _, after = body.partition("①")
                blocks.append(p(intro))
                blocks.append(p("① " + after.strip().lstrip("①").strip()))
                pending_art2 = True
            elif art in ("제4조", "제15조", "제19조"):
                blocks.append(p(body))
            elif art == "제7조":
                blocks.append(p(body))
                pending_art7 = True
            elif art == "제14조":
                intro, _, rest = body.partition("①")
                blocks.append(p(intro))
                for seg in re.split(r"(?=①|②|③|④)", "①" + rest):
                    seg = seg.strip()
                    if seg:
                        blocks.append(p(seg))
            elif art == "제17조":
                pass
            elif art == "제18조":
                intro, _, rest = body.partition("①")
                if intro.strip():
                    blocks.append(p(intro.strip()))
                for seg in re.split(r"(?=①|②|③|④|⑤|⑥)", "①" + rest):
                    seg = seg.strip()
                    if seg:
                        blocks.append(p(seg))
            elif art == "제20조":
                if "시행" in body:
                    idx = body.index("시행")
                    blocks.append(p(body[:idx].strip()))
                    blocks.append(p(body[idx:].strip()))
                else:
                    blocks.append(p(body))
            else:
                for seg in re.split(r"(?=①|②|③|④|⑤|⑥|⑦|⑧|⑨|⑩)", body):
                    seg = seg.strip()
                    if seg:
                        blocks.append(p(seg))
            i += 1
            continue

        if pending_art2 and text.startswith("②"):
            for seg in split_circled(text):
                blocks.append(p(seg))
            pending_art2 = False
            i += 1
            continue

        if pending_art7 and text.startswith("②"):
            blocks.extend(format_numbered_clause(text))
            pending_art7 = False
            i += 1
            continue

        if text.startswith("제17조"):
            blocks.append(h3("제17조 (손해밴상)"))
            i += 1
            while i < len(paras) and not re.match(r"^제\d+조", paras[i][0]):
                blocks.append(p(paras[i][0]))
                i += 1
            continue

        blocks.append(p(text))
        i += 1

    html_out = "\n".join(x for x in blocks if x)
    OUT.write_text(html_out, encoding="utf-8")
    print(f"Wrote {OUT} ({html_out.count('<h3>')} articles)")


if __name__ == "__main__":
    main()
