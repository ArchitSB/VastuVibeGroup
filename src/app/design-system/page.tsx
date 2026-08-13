import { DesignSystemDemo } from "@/components/ui/DesignSystemDemo";
import { Wordmark } from "@/components/brand/Wordmark";

const palette = ["obsidian", "charcoal", "champagne", "champagne-bright", "ivory", "ocean", "stone"];

export default function DesignSystemPage() {
  return (
    <main className="token-demo">
      <p className="eyebrow">VastuVibe Group · Design System</p>
      <Wordmark className="token-demo__wordmark" />
      <section>
        <h1>Quiet confidence, drawn in light.</h1>
        <p className="token-demo__body">
          Instrument Sans carries the practical voice. <em>Fraunces brings a cultivated warmth to decisive moments.</em>
        </p>
      </section>
      <section>
        <h2>Palette</h2>
        <div className="token-demo__palette">
          {palette.map((color) => (
            <div key={color}>
              <span style={{ backgroundColor: `var(--color-${color})` }} />
              <small>{color}</small>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2>Spring presets</h2>
        <DesignSystemDemo />
      </section>
    </main>
  );
}

