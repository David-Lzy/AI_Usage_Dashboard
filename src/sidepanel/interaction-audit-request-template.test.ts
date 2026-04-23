import { describe, expect, it } from "vitest";

import operatorReviewRequestTemplate from "../../fixtures/interaction-audit/operator-review-request-template.fixture.json";
import {
  buildInitialInteractionAuditSignoffMetadata,
  buildInitialInteractionAuditSignoffState,
  buildInteractionAuditSignoffExport,
} from "./interaction-audit-signoff";
import { INTERACTION_AUDIT_SIGNOFF_SURFACES } from "./interaction-audit-surfaces";

describe("interaction audit operator review request template fixture", () => {
  it("matches the current audit surface definitions and empty signoff export shape", () => {
    const expectedTemplate = buildInteractionAuditSignoffExport(
      INTERACTION_AUDIT_SIGNOFF_SURFACES,
      buildInitialInteractionAuditSignoffState(INTERACTION_AUDIT_SIGNOFF_SURFACES),
      buildInitialInteractionAuditSignoffMetadata(),
    );

    expect(operatorReviewRequestTemplate).toEqual(expectedTemplate);
  });
});
