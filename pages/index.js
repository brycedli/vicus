import MatcapBackground from "../components/MatcapBackground";
import MatcapAscii from "../components/MatcapAscii";
import dynamic from "next/dynamic";

const FlickerText = dynamic(() => import("../components/FlickerText"), {
  ssr: false
});

const CylinderText = dynamic(() => import("../components/CylinderText"), {
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
      <div className="main-content">
        <img
          src="/vicus_logo.svg"
          alt="Vicus logo"
          style={{
            height: 52,
            height: "auto"
          }}
        />
        <div className="main-text-group">
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

      <div className="vicus-tagline-corner"
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
        <div className="vicus-tagline-secondary">VICUS</div>
        <div className="vicus-tagline-bar" />
        <div className="vicus-tagline-secondary">latin for village</div>
      </div>

      <div className="footer-section">
        <div className="bottom-left-text">
          <div>BUILT ON TRUST</div>
          <div className="driven-by-excellence">DRIVEN BY EXCELLENCE</div>
        </div>
        <div className="bottom-right-cylinder">
          <CylinderText />
        </div>
      </div>
      {/* ASCII stays full opacity */}
    </main>
  );
}
