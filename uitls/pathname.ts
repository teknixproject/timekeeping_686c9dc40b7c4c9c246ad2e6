// utils/routeUtils.ts

// Hàm lấy tất cả route patterns (giữ nguyên từ code bạn cung cấp)
function normalizePath(path: string): string {
  return '/' + path.replace(/^\/+|\/+$/g, '');
}

// Hàm tìm pattern khớp với pathname
export function getMatchingRoutePattern(pathname: string, patterns: string[]): string | null {
  const normalizedPathname = normalizePath(pathname);

  for (let pattern of patterns) {
    pattern = normalizePath(pattern);
    const regexPattern = pattern
      .replace(/\[([^\]]+)\]/g, '([^/]+)')
      .replace(/\//g, '\\/')
      .replace(/^/, '^')
      .replace(/$/, '$');
    const regex = new RegExp(regexPattern);

    if (regex.test(normalizedPathname)) {
      return pattern;
    }
  }

  return null;
}
export function buildPathFromPattern(
  pattern: string,
  params: { key: string; value: string | number }[],
  getData: any
) {
  return params.reduce((acc, { key, value }) => {
    return acc.replace(`[${key}]`, encodeURIComponent(getData(value)));
  }, pattern);
}
