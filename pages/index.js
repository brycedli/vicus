import MatcapBackground from "../components/MatcapBackground";
import MatcapAscii from "../components/MatcapAscii";
import dynamic from "next/dynamic";

const FlickerText = dynamic(() => import("../components/FlickerText"), {
  ssr: false
});

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        color: "#FFF",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 44,
          left: 44,
          right: 44,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 44,
          maxWidth: 1000,
          fontFamily: "DM Mono, monospace",
          fontWeight: 300,
          fontSize: 20,
          lineHeight: 1.5,
          zIndex: 10
        }}
      >
        <img
          src="/vicus_logo.svg"
          alt="Vicus logo"
          style={{
            height: 52,
            height: "auto"
          }}
        />
        <div className="vicus-tagline-inline">
          <div>VICUS</div>
          <div className="vicus-tagline-bar" />
          <div>latin for village</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 24
          }}
        >
          <FlickerText
            text=
              "It takes a village to build something enduring. Vicus has built that village. We want to be the first call when things go wrong, and the last ones to leave your corner when things get hard."
          />
          <FlickerText
            text=
              "We combine high-conviction, hands-on investing with a deeply curated network of global operators, founders, investors, and celebrities in our investor base to accelerate company-building from day zero."
          />
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: 0.2 }}>
        <MatcapBackground />
      </div>

      <div
        style={{
          position: "absolute",
          left: 44,
          bottom: 44,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 4,
          fontFamily: "DM Mono, monospace",
          fontSize: 14,
          fontWeight: 500,
          textTransform: "uppercase",
          lineHeight: 1.35,
          color: "white"
        }}
      >
        <div >BUILT ON TRUST</div>
        <div style={{transform: 'translateX(40%)' }}>DRIVEN BY EXCELLENCE</div>
      </div>

      <div
        className="vicus-tagline-corner"
        style={{
          position: "absolute",
          right: 44,
          top: 44,
          alignItems: "center",
          gap: 11,
          fontFamily: "DM Mono, monospace",
          fontSize: 18,
          fontWeight: 500,
          textTransform: "uppercase",
          lineHeight: 1.35,
          color: "white"
        }}
      >
        <div>VICUS</div>
        <div className="vicus-tagline-bar" />
        <div>latin for village</div>
      </div>
      {/* ASCII stays full opacity */}
    </main>
  );
}
