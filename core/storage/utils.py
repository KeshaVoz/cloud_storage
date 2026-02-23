from django.shortcuts import redirect


def sanitize_key(key):
    if not key:
        return ''
    parts = [part.strip('./ ') for part in key.replace('\\', '/').split('/')]
    return '/'.join(part for part in parts if part)


def redirect_back_or_root(request):
    referer = request.META.get('HTTP_REFERER')
    if referer:
        return redirect(referer)
    else:
        return redirect('storage:root')
    

def create_breadcrumbs(path):
    breadcrumbs = []
    parts = [p for p in path.split('/') if p]
    cur = ''
    for part in parts:
        cur = f'{cur}/{part}' if cur else part
        breadcrumbs.append({'name': part, 'path': cur})
    return breadcrumbs