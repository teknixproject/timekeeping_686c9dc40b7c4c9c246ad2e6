export const fetchMetadata = async (path: string) => {
  if (!path) {
    console.warn('Path is undefined or empty, skipping fetchMetadata');
    return null; // Hoặc trả về giá trị mặc định nếu cần
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/seo-metadata?projectId=${process.env.NEXT_PUBLIC_PROJECT_ID}&uid=${path}`,
      { cache: 'no-store' }
    );
    return await res.json();
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return null;
  }
};
