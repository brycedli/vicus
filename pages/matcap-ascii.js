import dynamic from "next/dynamic";

const MatcapAscii = dynamic(() => import("../components/MatcapAscii"), {
  ssr: false,
});

const MatcapBackground = dynamic(
  () => import("../components/MatcapBackground"),
  { ssr: false }
);

export default function MatcapAsciiPage() {
  return (
    <>
      
    </>
  );
}
