import media from "../../../public/media/media.json";

type AssetKey = keyof typeof media.assets;

function MediaPicture({ assetKey, className = "" }: { assetKey: AssetKey; className?: string }) {
  const asset = media.assets[assetKey];
  return (
    <picture className={className}>
      <source
        type="image/avif"
        srcSet={`${asset.variants["640"].avif} 640w, ${asset.variants["1280"].avif} 1280w, ${asset.variants["2000"].avif} 2000w`}
      />
      <source
        type="image/webp"
        srcSet={`${asset.variants["640"].webp} 640w, ${asset.variants["1280"].webp} 1280w, ${asset.variants["2000"].webp} 2000w`}
      />
      <img
        src={asset.variants["1280"].jpg}
        srcSet={`${asset.variants["640"].jpg} 640w, ${asset.variants["1280"].jpg} 1280w, ${asset.variants["2000"].jpg} 2000w`}
        sizes="(max-width: 760px) 92vw, 44vw"
        alt={asset.alt}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
}

export function HomepageStubs() {
  return (
    <div className="page-surface">
      <section id="residences" className="editorial-section residences-section">
        <div className="section-heading">
          <p className="eyebrow">Curated Dubai residences</p>
          <h2>Homes for lives lived beyond borders.</h2>
          <p>
            A considered selection of waterfront residences, skyline homes and private villas—presented in Dar es
            Salaam by one trusted Tanzanian team.
          </p>
        </div>
        <div className="residence-grid">
          <article className="residence-card residence-card--wide">
            <MediaPicture assetKey="marina-night" />
            <div><span>01</span><h3>Marina after dark</h3><p>Waterfront calm, metropolitan energy.</p></div>
          </article>
          <article className="residence-card">
            <MediaPicture assetKey="lagoon-aerial" />
            <div><span>02</span><h3>Lagoon living</h3><p>Blue horizons and private arrival.</p></div>
          </article>
          <article className="residence-card">
            <MediaPicture assetKey="villas-dusk" />
            <div><span>03</span><h3>Private villas</h3><p>Space, privacy and architectural poise.</p></div>
          </article>
        </div>
        <p className="credential-line">Selected opportunities by DAMAC Properties, Dubai</p>
      </section>

      <section id="deal" className="editorial-section deal-section">
        <MediaPicture assetKey="interior-night" className="deal-section__image" />
        <div className="deal-section__copy">
          <p className="eyebrow">The VastuVibe difference</p>
          <h2>Dubai access. Tanzanian understanding.</h2>
          <p>
            From first conversation to handover, our Dar es Salaam team keeps every detail clear, private and close
            to home.
          </p>
          <ol>
            <li><span>01</span>Private discovery</li>
            <li><span>02</span>Curated introductions</li>
            <li><span>03</span>End-to-end guidance</li>
          </ol>
        </div>
      </section>

      <section id="tanzania" className="editorial-section tanzania-section">
        <div className="tanzania-section__copy">
          <p className="eyebrow">Rooted in Tanzania</p>
          <h2>Global ambition, with an Indian Ocean point of view.</h2>
          <p>
            Alongside our Dubai portfolio, VastuVibe is building a local real-estate line shaped by the coast, the
            city and the future of Tanzania.
          </p>
          <a className="text-link" href="#contact">Begin a conversation <span aria-hidden="true">↗</span></a>
        </div>
        <div className="tanzania-section__images">
          <MediaPicture assetKey="dar-coast" />
          <MediaPicture assetKey="city-teal" />
        </div>
      </section>

      <section className="closing-section" aria-label="Contact invitation">
        <p className="eyebrow">VastuVibe Private Office</p>
        <h2>Your next address begins with a conversation.</h2>
        <a
          className="button button--outline"
          href="https://wa.me/255789113131?text=Hello%20VastuVibe%20Group%2C%20I%27m%20interested%20in%20Dubai%20properties."
          target="_blank"
          rel="noreferrer"
        >
          Speak with our Dar es Salaam team
        </a>
      </section>
    </div>
  );
}

