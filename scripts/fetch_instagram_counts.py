import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests

PROFILES = {
    "vozinha": "Vozinha1",
    "neymar": "neymarjr",
}

DATA_PATH = Path("data.json")


def load_old_data():
    if DATA_PATH.exists():
        try:
            return json.loads(DATA_PATH.read_text(encoding="utf-8"))
        except Exception:
            pass

    return {
        "vozinha": 8900000,
        "neymar": 230000000,
        "updated_at": None,
        "source": "fallback inicial",
        "ok": False,
    }


def parse_abbrev_number(text):
    text = text.strip().replace(",", ".")
    m = re.match(r"([0-9]+(?:\.[0-9]+)?)\s*([KMB])?", text, flags=re.I)
    if not m:
        return None

    number = float(m.group(1))
    suffix = (m.group(2) or "").upper()
    mult = {"K": 1_000, "M": 1_000_000, "B": 1_000_000_000}.get(suffix, 1)
    return int(number * mult)


def get_from_imginn(username):
    """
    Imginn costuma espelhar dados públicos do Instagram e é menos chato para scraping.
    Não é oficial. Se falhar, mantemos o último data.json.
    """
    url = f"https://imginn.com/{username}/"
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7",
    }
    r = requests.get(url, headers=headers, timeout=20)
    r.raise_for_status()
    html = r.text

    # Padrões comuns: "8.9M followers", "Followers 8.9M", etc.
    patterns = [
        r"([0-9][0-9.,]*\s*[KMB]?)\s+followers",
        r"Followers\s*</[^>]+>\s*<[^>]+>\s*([0-9][0-9.,]*\s*[KMB]?)",
        r"followers[^0-9]+([0-9][0-9.,]*\s*[KMB]?)",
    ]

    for pat in patterns:
        m = re.search(pat, html, flags=re.I)
        if m:
            value = parse_abbrev_number(m.group(1))
            if value:
                return value

    raise RuntimeError(f"Não achei seguidores em Imginn para @{username}")


def get_from_instagram_meta(username):
    """
    Tentativa leve no HTML público. Muitas vezes o Instagram não entrega mais esse dado.
    """
    url = f"https://www.instagram.com/{username}/"
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7",
    }
    r = requests.get(url, headers=headers, timeout=20)
    r.raise_for_status()
    html = r.text

    patterns = [
        r'"edge_followed_by"\s*:\s*\{\s*"count"\s*:\s*(\d+)\s*\}',
        r'"follower_count"\s*:\s*(\d+)',
        r'"followers_count"\s*:\s*(\d+)',
        r'content=["\'][^"\']*?([0-9][0-9.,]*\s*[KMB]?)\s+Followers',
    ]

    for pat in patterns:
        m = re.search(pat, html, flags=re.I)
        if m:
            raw = m.group(1)
            if raw.isdigit():
                return int(raw)
            value = parse_abbrev_number(raw)
            if value:
                return value

    raise RuntimeError(f"Não achei seguidores no HTML do Instagram para @{username}")


def get_followers(username):
    errors = []

    for method in (get_from_imginn, get_from_instagram_meta):
        try:
            return method(username)
        except Exception as exc:
            errors.append(f"{method.__name__}: {exc}")

    raise RuntimeError(" | ".join(errors))


def main():
    old = load_old_data()
    new = dict(old)
    errors = {}

    for key, username in PROFILES.items():
        try:
            new[key] = get_followers(username)
        except Exception as exc:
            errors[key] = str(exc)
            new[key] = old.get(key)

    new["updated_at"] = datetime.now(timezone.utc).isoformat()
    new["source"] = "imginn fallback + instagram public html"
    new["ok"] = len(errors) == 0

    if errors:
        new["errors"] = errors
    else:
        new.pop("errors", None)

    DATA_PATH.write_text(json.dumps(new, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(new, indent=2, ensure_ascii=False))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
