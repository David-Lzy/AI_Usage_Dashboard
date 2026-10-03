import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { animateMotion, type MotionElement } from "./motion-runtime";
import { canInterpolateProgress, type ProgressMotionSample } from "./progress-motion";

const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function useProgressMotion(
  ref: RefObject<HTMLElement | null>,
  samples: readonly ProgressMotionSample[],
) {
  const previous = useRef(new Map<string, ProgressMotionSample>());
  const previousDash = useRef(new Map<string, string>());
  const cancels = useRef<(() => void)[]>([]);
  const signature = JSON.stringify(samples);
  useBrowserLayoutEffect(() => {
    const root = ref.current;
    if (!root) {
      for (const cancel of cancels.current) cancel();
      cancels.current = [];
      previous.current.clear();
      previousDash.current.clear();
      return;
    }
    const currentVisuals = new Map<MotionElement, { width: string; percent: string; dash: string }>();
    for (const node of root.querySelectorAll<MotionElement>(
      ".usage-progress__fill, .usage-progress__ring, .usage-progress-ring, .usage-progress-ring__fill",
    )) {
      // Only an interrupted fill needs its computed visual position.
      if (node.dataset.motionActive !== "progress") continue;
      const style = getComputedStyle(node);
      currentVisuals.set(node, {
        width: style.width,
        percent: style.getPropertyValue(node.matches(".usage-progress__ring")
          ? "--usage-progress-percent" : "--usage-progress-ring-percent").trim(),
        dash: style.strokeDasharray,
      });
    }
    for (const cancel of cancels.current) cancel();
    cancels.current = [];
    const nextSamples: ProgressMotionSample[] = JSON.parse(signature);
    const nextDash = new Map<string, string>();
    const now = Date.now();
    for (const item of root.querySelectorAll<HTMLElement>("[data-provider-progress-item]")) {
      const id = item.dataset.providerProgressItem!;
      const gauge = item.querySelector<SVGElement>(".usage-progress-ring__fill");
      if (gauge) nextDash.set(id, gauge.getAttribute("stroke-dasharray")!);
      const sample = nextSamples.find((value) => value.id === item.dataset.providerProgressItem);
      if (!sample || !canInterpolateProgress(previous.current.get(sample.id), sample, now) || !item.checkVisibility() || item.closest("[inert]")) continue;
      const old = previous.current.get(sample.id)!;
      const target = item.querySelector<MotionElement>(
        ".usage-progress__fill, .usage-progress__ring, .usage-progress-ring__fill, .usage-progress-ring--circle-soft",
      );
      if (!target || old.percent === sample.percent) continue;
      const visual = currentVisuals.get(target);
      let frames: Keyframe[];
      if (target.matches(".usage-progress__fill")) {
        let fromWidth = `${old.percent}%`;
        if (visual) {
          const parentWidth = target.parentElement!.getBoundingClientRect().width;
          const width = parseFloat(visual.width);
          if (parentWidth > 0 && Number.isFinite(width)) fromWidth = `${width / parentWidth * 100}%`;
        }
        frames = [{ width: fromWidth }, { width: `${sample.percent}%` }];
      } else if (target.matches(".usage-progress-ring__fill")) {
        const oldDash = previousDash.current.get(id);
        if (!oldDash) continue;
        frames = [{ strokeDasharray: visual ? visual.dash : oldDash }, { strokeDasharray: nextDash.get(id)! }];
      } else {
        const property = target.matches(".usage-progress__ring") ? "--usage-progress-percent" : "--usage-progress-ring-percent";
        frames = [{ [property]: visual ? visual.percent : `${old.percent}%` }, { [property]: `${sample.percent}%` }];
      }
      const cancel = animateMotion(target, frames, { channel: "progress", speed: "slow" });
      if (cancel) cancels.current.push(cancel);
    }
    previous.current = new Map(nextSamples.map((sample) => [sample.id, sample]));
    previousDash.current = nextDash;
  }, [ref, signature]);
  useEffect(() => () => { for (const cancel of cancels.current) cancel(); }, []);
}
