#!/usr/bin/env python3
"""
Extract Tech Tips blog posts from WordPress SQL backup
"""

import json
import re
import os
from html import unescape

SQL_FILE = '/Users/louis/Desktop/AiMV Website/Legacy files/ct_anyt_a2bja.sql'
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'tech-tips.json')

def strip_html_to_markdown(content):
    """Convert HTML content to Markdown"""
    cleaned = content

    # Remove WordPress shortcodes
    cleaned = re.sub(r'\[wolf_col_\d+[^\]]*\]', '', cleaned)
    cleaned = re.sub(r'\[/wolf_col_\d+\]', '', cleaned)
    cleaned = re.sub(r'\[caption[^\]]*\]', '', cleaned)
    cleaned = re.sub(r'\[/caption\]', '', cleaned)

    # Remove WordPress Gutenberg block comments
    cleaned = re.sub(r'<!-- wp:[^>]+-->', '', cleaned)
    cleaned = re.sub(r'<!-- /wp:[^>]+-->', '', cleaned)

    # Convert headers
    cleaned = re.sub(r'<h1[^>]*>(.*?)</h1>', r'\n\n# \1\n\n', cleaned, flags=re.IGNORECASE | re.DOTALL)
    cleaned = re.sub(r'<h2[^>]*>(.*?)</h2>', r'\n\n## \1\n\n', cleaned, flags=re.IGNORECASE | re.DOTALL)
    cleaned = re.sub(r'<h3[^>]*>(.*?)</h3>', r'\n\n### \1\n\n', cleaned, flags=re.IGNORECASE | re.DOTALL)
    cleaned = re.sub(r'<h4[^>]*>(.*?)</h4>', r'\n\n#### \1\n\n', cleaned, flags=re.IGNORECASE | re.DOTALL)

    # Convert paragraphs
    cleaned = re.sub(r'<p[^>]*>', '\n\n', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'</p>', '\n\n', cleaned, flags=re.IGNORECASE)

    # Convert line breaks
    cleaned = re.sub(r'<br\s*/?>', '\n', cleaned, flags=re.IGNORECASE)
    cleaned = cleaned.replace('\\r\\n', '\n')
    cleaned = cleaned.replace('\\n', '\n')

    # Convert links
    cleaned = re.sub(r'<a[^>]*href="([^"]*)"[^>]*>(.*?)</a>', r'[\2](\1)', cleaned, flags=re.IGNORECASE | re.DOTALL)

    # Convert images
    cleaned = re.sub(r'<img[^>]*src="([^"]*)"[^>]*/?>', r'![](\1)', cleaned, flags=re.IGNORECASE)

    # Convert lists
    cleaned = re.sub(r'<li[^>]*>', '- ', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'</li>', '\n', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'</?[ou]l[^>]*>', '\n', cleaned, flags=re.IGNORECASE)

    # Convert bold/italic
    cleaned = re.sub(r'<(strong|b)[^>]*>(.*?)</(strong|b)>', r'**\2**', cleaned, flags=re.IGNORECASE | re.DOTALL)
    cleaned = re.sub(r'<(em|i)[^>]*>(.*?)</(em|i)>', r'*\2*', cleaned, flags=re.IGNORECASE | re.DOTALL)

    # Remove divs, spans, centers
    cleaned = re.sub(r'</?div[^>]*>', '\n', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'</?span[^>]*>', '', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'</?center>', '\n', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'</?blockquote[^>]*>', '\n> ', cleaned, flags=re.IGNORECASE)

    # Remove horizontal rules
    cleaned = re.sub(r'<hr[^>]*/?>', '\n\n---\n\n', cleaned, flags=re.IGNORECASE)

    # Remove remaining HTML tags
    cleaned = re.sub(r'<[^>]+>', '', cleaned)

    # Decode HTML entities
    cleaned = unescape(cleaned)

    # Clean up whitespace
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
    cleaned = cleaned.strip()

    return cleaned

def extract_excerpt(content, max_length=200):
    """Extract first meaningful paragraph as excerpt"""
    stripped = strip_html_to_markdown(content)
    paragraphs = [p for p in stripped.split('\n\n') if p.strip() and not p.startswith('#') and not p.startswith('!')]
    first_para = paragraphs[0] if paragraphs else ''

    if len(first_para) <= max_length:
        return first_para
    return first_para[:max_length].rsplit(' ', 1)[0] + '...'

def parse_sql_string(sql, start_idx):
    """Parse a SQL string value starting at given index (after opening quote)"""
    value = ''
    i = start_idx

    while i < len(sql):
        char = sql[i]

        if char == '\\' and i + 1 < len(sql):
            # Escaped character
            value += sql[i + 1]
            i += 2
        elif char == "'" and i + 1 < len(sql) and sql[i + 1] == "'":
            # SQL escaped quote
            value += "'"
            i += 2
        elif char == "'":
            # End of string
            return value, i
        else:
            value += char
            i += 1

    return None, -1

def main():
    print('Reading SQL file...')
    with open(SQL_FILE, 'r', encoding='utf-8', errors='replace') as f:
        sql = f.read()

    posts = []

    # Find blog posts by searching for 'post', '', X) patterns
    # These end the wp_posts rows for actual blog posts
    pattern = re.compile(r"\((\d+), (\d+), '(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})', '[^']+', '((?:[^'\\\\]|\\\\.)*)', '((?:[^'\\\\]|\\\\.)*)', '[^']*', 'publish'")

    for match in pattern.finditer(sql):
        try:
            post_id = int(match.group(1))
            date = match.group(3)
            content = match.group(4).replace("\\'", "'").replace('\\"', '"').replace('\\\\', '\\')
            title = match.group(5).replace("\\'", "'").replace('\\"', '"')

            # Now we need to find the rest of this row to check if it's post_type = 'post'
            row_end = sql.find('),', match.end())
            if row_end == -1:
                continue

            row_rest = sql[match.end():row_end + 2]

            # Check if this row ends with 'post', '', X)
            if "'post', ''" not in row_rest:
                continue

            # Extract slug - it's after 'publish', 'open', 'open', '',
            slug_match = re.search(r"'publish', '[^']*', '[^']*', '[^']*', '([^']*)'", sql[match.start():row_end])
            if not slug_match:
                continue
            slug = slug_match.group(1)

            if not slug:
                continue

            posts.append({
                'id': post_id,
                'title': unescape(title),
                'slug': slug,
                'date': date,
                'content': content,
                'excerpt': extract_excerpt(content),
                'contentMarkdown': strip_html_to_markdown(content)
            })
        except Exception as e:
            print(f"Error parsing post: {e}")
            continue

    print(f'Found {len(posts)} blog posts')

    # Remove duplicates by ID
    seen_ids = set()
    unique_posts = []
    for post in posts:
        if post['id'] not in seen_ids:
            seen_ids.add(post['id'])
            unique_posts.append(post)

    # Sort by date descending
    unique_posts.sort(key=lambda p: p['date'], reverse=True)

    # Ensure output directory exists
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

    # Write output
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(unique_posts, f, indent=2, ensure_ascii=False)

    print(f'\nWrote {len(unique_posts)} posts to {OUTPUT_FILE}')

    print('\n=== Posts Found ===')
    for post in unique_posts:
        print(f"- {post['title']} ({post['date'].split(' ')[0]})")
        print(f"  Slug: {post['slug']}")

if __name__ == '__main__':
    main()
