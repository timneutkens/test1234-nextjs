import UIHeader from "./UIHeader";

const UIPage = async ({ children }: any) => {
  return (
    <main id="main" className="min-h-screen">
      <UIHeader />
      {children}
    </main>
  );
};

export default UIPage;

// export const dynamicParams = false // true | false,
// export const revalidate = 300 // revalidate this page every 5 minutes
//export const dynamic = 'force-static'
