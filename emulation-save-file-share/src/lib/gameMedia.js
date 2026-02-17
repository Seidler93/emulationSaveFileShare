export function getGameMedia(game) {
  const serial = game?.serial;

  // Default platform for now
  const platform = "rpcs3"; // later: "pcsx2"
  const platformLabel = "RPCS3 / PS3";

  const base = import.meta.env.BASE_URL; // usually "/" in dev, "./" in prod if configured

  const platformIconUrl = `${base}media/platform/${platform}.png`;
  const bgUrl = serial ? `${base}media/bg/${serial}.png` : "";
  const logoUrl = serial ? `${base}media/logo/${serial}.png` : "";


  return { bgUrl, logoUrl, platformIconUrl, platformLabel };
}
