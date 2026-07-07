import { config } from "dotenv";

config({ path: ".env.local" });

import { prepareHeroAssets } from "./media-lib";

async function main() {
  const logs = await prepareHeroAssets();
  for (const line of logs) console.log(line);
  console.log("Pour uploader dans Payload : curl -X POST http://localhost:3000/api/seed/media");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
