import { runCurrentPopupReview } from "./lib/current-popup-review-helpers.mjs";

await runCurrentPopupReview({
  phaseNumber: 123,
  artifactDirName: "phase123-popup-setup-stage-hierarchy-review",
});
