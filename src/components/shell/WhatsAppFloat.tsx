import { motionTheme } from "@/lib/motion-theme";

const whatsapp =
  "https://wa.me/255789113131?text=Hello%20VastuVibe%20Group%2C%20I%27m%20interested%20in%20Dubai%20properties.";

export function WhatsAppFloat() {
  return (
    <a
      className="whatsapp-float"
      href={whatsapp}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with VastuVibe Group on WhatsApp"
      style={{ "--pulse-duration": `${motionTheme.duration.ambient}s` } as React.CSSProperties}
    >
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M16 4.3A10.9 10.9 0 0 0 6.55 20.6L5.1 27l6.55-1.38A10.9 10.9 0 1 0 16 4.3Zm0 19.55c-1.48 0-2.9-.38-4.17-1.1l-.46-.27-3.88.82.83-3.78-.3-.48A8.68 8.68 0 1 1 16 23.85Zm4.76-6.49c-.26-.13-1.54-.76-1.78-.85-.24-.09-.41-.13-.59.13-.17.26-.67.85-.82 1.02-.15.17-.3.2-.56.07-.26-.13-1.1-.41-2.1-1.3a7.9 7.9 0 0 1-1.45-1.8c-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.46.13-.15.17-.26.26-.44.09-.17.04-.33-.02-.46-.07-.13-.59-1.42-.8-1.94-.21-.51-.43-.44-.59-.45h-.5c-.17 0-.46.07-.7.33-.24.26-.91.89-.91 2.18 0 1.28.94 2.52 1.07 2.69.13.17 1.84 2.81 4.46 3.94.62.27 1.11.43 1.49.55.63.2 1.2.17 1.65.1.5-.08 1.54-.63 1.76-1.24.22-.61.22-1.13.15-1.24-.06-.1-.24-.17-.5-.3Z" />
      </svg>
    </a>
  );
}
