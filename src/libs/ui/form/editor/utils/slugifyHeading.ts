export function slugifyHeading(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[\u0600-\u06FF\s]+/g, (match) => match.trim().replace(/\s+/g, '-'))
        .replace(/[^\w\u0600-\u06FF-]/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+|-+$/g, '');
}
