export function getGameMedia(game) {
  const serial = game?.serial;

  // Default platform for now
  const platform = "rpcs3"; // later: "pcsx2"
  const platformLabel = "RPCS3 / PS3";

  // Your custom art, keyed by serial
  const bgUrl = serial ? `/media/bg/${serial}.png` : "";
  const logoUrl = serial ? `/media/logo/${serial}.png` : "";

  // Small corner badge
  const platformIconUrl = `/media/platform/${platform}.png`;

  return { bgUrl, logoUrl, platformIconUrl, platformLabel };
}
