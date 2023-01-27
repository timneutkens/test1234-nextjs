const UIGeneralPage = async ({ params }: any) => {
  return (
    <div>
      <h1>{params.dynamicSlug}</h1>
    </div>
  );
};

export default UIGeneralPage;

export const generateStaticParams = async () => {
  return [
    { variant: "no-variant", dynamicSlug: [""] },
    { variant: "no-variant", dynamicSlug: ["who-we-are"] },
    { variant: "no-variant", dynamicSlug: ["about"] },
    { variant: "no-variant", dynamicSlug: ["contact"] },
  ];
};

// true (default): Dynamic segments not included in generateStaticParams are generated on demand.
// false: Dynamic segments not included in generateStaticParams will return a 404.
export const dynamicParams = false; // true | false,
export const revalidate = 300; // revalidate this page every 60 seconds
//export const dynamic = 'force-static'
