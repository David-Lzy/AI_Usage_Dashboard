import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ApiGatewayDeploymentSelector } from "./ApiGatewayDeploymentSelector";
import { ApiGatewayDeploymentSelector as CompatibleSelector } from "./ApiGatewayMeteringSummary";

const options = [
  { id: "account_fixture1", label: "Primary" },
  { id: "account_fixture2", label: "Secondary" },
];

describe("deployment selector module", () => {
  it("retains the existing named export without a wrapper", () => {
    expect(CompatibleSelector).toBe(ApiGatewayDeploymentSelector);
  });

  it("renders a bounded read-only label for a single account or missing handler", () => {
    for (const props of [{ options: options.slice(0, 1), onSelectDeployment: () => {} }, { options }]) {
      const html = renderToStaticMarkup(<ApiGatewayDeploymentSelector {...props} activeDeploymentId="account_fixture1" displayLabel="Fallback" summaryLabel="Summary" />);
      expect(html).toContain('title="Primary"');
      expect(html).not.toContain('role="combobox"');
      expect(html).toContain("api-gateway-metering-deployment--single");
    }
  });

  it("keeps the multi-account combobox accessible and closed until requested", () => {
    const html = renderToStaticMarkup(<ApiGatewayDeploymentSelector options={options} activeDeploymentId="account_fixture2" displayLabel="Fallback" summaryLabel="Summary" onSelectDeployment={() => {}} />);
    expect(html).toContain('role="combobox"');
    expect(html).toContain('aria-haspopup="listbox"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-label="Summary: Secondary"');
    expect(html).toContain('title="Secondary"');
    expect(html).not.toContain('role="listbox"');
  });
});
