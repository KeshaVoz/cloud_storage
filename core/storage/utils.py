def sanitize_key(key: str) -> str:
    if not key:
        return ''
    parts = [part.strip('./ ') for part in key.replace('\\', '/').split('/')]
    return '/'.join(part for part in parts if part)
