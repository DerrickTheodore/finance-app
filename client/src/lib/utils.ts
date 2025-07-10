export const getApiBaseUrl = () => {
  if (typeof window === "undefined") {
    // For server-side rendering or build process, prefer SERVER_API_URL
    return (
      process.env.SERVER_API_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3001"
    );
  }
  // For client-side execution
  return "";
};
