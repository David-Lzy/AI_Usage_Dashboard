import { MOTION_PROFILES, type MotionProfile } from "./motion-preferences";

type MotionSpeed = "fast" | "medium" | "slow";
type MotionSubscription = { listeners: Set<() => void>; stop: () => void };
const environments = new WeakMap<Document, MotionSubscription>();
const running = new WeakMap<HTMLElement, Map<string, () => void>>();

export function readMotion(element: HTMLElement) {
  const doc = element.ownerDocument;
  const value = doc.documentElement.dataset.motionProfile;
  const profile: MotionProfile = doc.visibilityState === "hidden" ||
    doc.documentElement.dataset.motionResolved === "reduced"
    ? "reduced"
    : value === "expressive" ? "expressive" : "standard";
  return { profile, ...MOTION_PROFILES[profile] };
}

export function observeMotionEnvironment(doc: Document, listener: () => void) {
  let environment = environments.get(doc);
  if (!environment) {
    const listeners = new Set<() => void>();
    const notify = () => { for (const callback of [...listeners]) callback(); };
    const observer = new MutationObserver(notify);
    observer.observe(doc.documentElement, {
      attributes: true,
      attributeFilter: ["data-motion-profile", "data-motion-resolved", "dir"],
    });
    doc.addEventListener("visibilitychange", notify);
    environment = { listeners, stop: () => {
      observer.disconnect();
      doc.removeEventListener("visibilitychange", notify);
      environments.delete(doc);
    } };
    environments.set(doc, environment);
  }
  const current = environment;
  current.listeners.add(listener);
  return () => {
    current.listeners.delete(listener);
    if (!current.listeners.size) current.stop();
  };
}

// Each channel has one owner. A cancelled predecessor cannot complete a newer
// disclosure or navigation, including when its finished promise already resolved.
export function animateMotion(
  element: HTMLElement,
  frames: Keyframe[],
  options: {
    channel?: string;
    speed?: MotionSpeed;
    duration?: number;
    delay?: number;
    easing?: string;
    onFinish?: () => void;
  } = {},
): (() => void) | null {
  const channel = options.channel ?? "entry";
  const owners = running.get(element) ?? new Map<string, () => void>();
  running.set(element, owners);
  owners.get(channel)?.();
  const motion = readMotion(element);
  const duration = Math.max(0, Math.min(motion[options.speed ?? "medium"], options.duration ?? Infinity));
  if (!duration || typeof element.animate !== "function") {
    options.onFinish?.();
    return null;
  }
  const animation = element.animate(frames, {
    duration, delay: Math.min(90, options.delay ?? 0),
    easing: options.easing ?? "cubic-bezier(0.2, 0, 0, 1)",
    fill: "both",
  });
  let stopped = false;
  let detach = () => {};
  const cancel = () => {
    if (stopped) return;
    stopped = true;
    detach();
    animation.cancel();
    if (owners.get(channel) === cancel) owners.delete(channel);
    if (!owners.size) delete element.dataset.motionActive;
  };
  const complete = () => {
    if (stopped || owners.get(channel) !== cancel) return;
    cancel();
    options.onFinish?.();
  };
  owners.set(channel, cancel);
  element.dataset.motionActive = channel;
  detach = observeMotionEnvironment(element.ownerDocument, () => {
    if (readMotion(element).profile !== motion.profile ||
        element.ownerDocument.visibilityState === "hidden") complete();
  });
  void animation.finished.then(complete, () => {});
  return cancel;
}

export function animateEntrance(element: HTMLElement, index = 0) {
  const motion = readMotion(element);
  return animateMotion(element, [
    { opacity: 0, transform: `translateY(${motion.distance}px)` },
    { opacity: 1, transform: "none" },
  ], { delay: Math.min(3, index) * motion.stagger });
}
