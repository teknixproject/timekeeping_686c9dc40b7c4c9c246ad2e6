'use client'; // Mark as client-only component

import LoadingPage from '../loadingPage';
import dynamic from 'next/dynamic';

interface PreviewUIProps {
  customWidgetName: string | null;
}

const DynamicComponent = ({ customWidgetName }: PreviewUIProps) => {
  // Fallback if customWidgetName is invalid
  if (!customWidgetName || typeof customWidgetName !== 'string') {
    return <div className="">Sorry! You are lacking customwidgetname param 🥲</div>;
  }

  // Dynamic import with error handling
  const CustomWidget = dynamic(
    () =>
      import(`@/components/commons/${customWidgetName}`).catch((error) => {
        console.error(`Failed to load component ${customWidgetName}:`, error);
        const ErrorComponent = () => (
          <div className="w-full h-screen flex items-center justify-center">
            Error loading component 🥲, Widgets do not exist!
          </div>
        );
        ErrorComponent.displayName = 'ErrorComponent';
        return ErrorComponent;
      }),
    {
      loading: () => <LoadingPage />,
      ssr: false, // Disable SSR to avoid hydration issues
    }
  );

  return (
    <div className='w-full h-screen flex items-center justify-center'>
      <CustomWidget />
    </div>
  );
};

export default DynamicComponent;
