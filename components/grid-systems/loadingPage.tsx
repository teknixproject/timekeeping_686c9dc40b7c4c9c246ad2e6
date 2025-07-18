// import { getDeviceType } from "@/lib/utils";

const LoadingPage = () => {
  // const sizeScreen = getDeviceType();
  // const isMobile = sizeScreen === "mobile";

  return (
    <div
      role="status"
      className="w-full h-[500px] px-[120px] flex gap-5 items-center justify-between animate-pulse"
    >
      <div className="h-[300px] bg-gray-200 rounded-sm dark:bg-gray-700 w-full"></div>
      <div className="h-[300px] bg-gray-200 rounded-sm dark:bg-gray-700 w-full"></div>
      <div className="h-[300px] bg-gray-200 rounded-sm dark:bg-gray-700 w-full"></div>
      <div className="h-[300px] bg-gray-200 rounded-sm dark:bg-gray-700 w-full"></div>
    </div>
  );
};

export default LoadingPage;
