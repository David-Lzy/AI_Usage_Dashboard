import { useEffect, useState } from "react";

import {
  getSpecialSidePanelRoute,
  SpecialRouteApp,
} from "./special-route-app";
import { StandardRouteApp } from "./standard-route-app";

export function App() {
  const [locationHash, setLocationHash] = useState(() =>
    typeof window !== "undefined" ? window.location.hash : "",
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleHashChange = () => {
      setLocationHash(window.location.hash);
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const specialRoute = getSpecialSidePanelRoute(locationHash);

  if (specialRoute) {
    return <SpecialRouteApp route={specialRoute} />;
  }

  return <StandardRouteApp locationHash={locationHash} />;
}
