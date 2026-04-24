import { closeRdpExtensionWindows } from "./lib/rdp-extension-runtime-capture.mjs";

async function run() {
  const result = await closeRdpExtensionWindows({});
  console.log(
    `rdp-runtime-cleanup: closed ${result.closedCount} AI Usage Dashboard window(s)`,
  );
}

void run().catch((error) => {
  console.error("rdp-runtime-cleanup: failed to close extension runtime windows");
  console.error(error);
  process.exitCode = 1;
});
