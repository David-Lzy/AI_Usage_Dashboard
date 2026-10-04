import { afterEach, describe, expect, it, vi } from "vitest";
import { animateEntrance, animateMotion, readMotion } from "./motion-runtime";

function fixture(profile = "standard") {
  const callbacks: Array<() => void> = [];
  const disconnect = vi.fn();
  vi.stubGlobal("MutationObserver", class {
    constructor(callback: () => void) { callbacks.push(callback); }
    observe() {}
    disconnect = disconnect;
  });
  const doc = Object.assign(new EventTarget(), {
    documentElement: { dataset: { motionProfile: profile, motionResolved: "full" } },
    visibilityState: "visible",
  });
  const animations: Array<{ finish: () => void; cancel: ReturnType<typeof vi.fn>; options: KeyframeAnimationOptions }> = [];
  const element = { ownerDocument: doc, dataset: {}, animate: vi.fn((_frames: Keyframe[], options: KeyframeAnimationOptions) => {
    let finish!: () => void;
    const finished = new Promise<void>((resolve) => { finish = resolve; });
    const cancel = vi.fn();
    animations.push({ finish, cancel, options });
    return { finished, cancel };
  }) } as unknown as HTMLElement;
  return { doc, element, animations, disconnect, changed: () => callbacks.forEach((callback) => callback()) };
}

afterEach(() => vi.unstubAllGlobals());

describe("motion runtime", () => {
  it("cancels superseded owners without letting their completion hide newer content", async () => {
    const { element, animations, disconnect } = fixture();
    const oldDone = vi.fn();
    const newDone = vi.fn();
    animateMotion(element, [], { onFinish: oldDone });
    animateMotion(element, [], { onFinish: newDone });
    animations[0].finish();
    await Promise.resolve();
    expect(oldDone).not.toHaveBeenCalled();
    expect(animations[0].cancel).toHaveBeenCalledOnce();
    expect(element.dataset.motionActive).toBe("entry");
    animations[1].finish();
    await Promise.resolve();
    expect(newDone).toHaveBeenCalledOnce();
    expect(element.dataset.motionActive).toBeUndefined();
    expect(disconnect).toHaveBeenCalledTimes(2);
  });

  it("settles to the real final state on a mode change or backgrounding", () => {
    const { doc, element, animations, changed } = fixture("expressive");
    const done = vi.fn();
    animateMotion(element, [], { onFinish: done });
    doc.documentElement.dataset.motionResolved = "reduced";
    changed();
    expect(done).toHaveBeenCalledOnce();
    expect(animations[0].cancel).toHaveBeenCalledOnce();
    expect(readMotion(element).medium).toBe(0);
    doc.documentElement.dataset.motionResolved = "full";
    animateMotion(element, [], { onFinish: done });
    doc.visibilityState = "hidden";
    doc.dispatchEvent(new Event("visibilitychange"));
    expect(done).toHaveBeenCalledTimes(2);
    expect(element.dataset.motionActive).toBeUndefined();
  });

  it("caps expressive group staggering and cleans up explicit cancellations", () => {
    const { element, animations, disconnect } = fixture("expressive");
    const cancel = animateEntrance(element, 9);
    expect(animations[0].options.duration).toBe(270);
    expect(animations[0].options.delay).toBe(90);
    cancel?.();
    cancel?.();
    expect(animations[0].cancel).toHaveBeenCalledOnce();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it("is immediate in reduced mode and when WAAPI is unavailable", () => {
    const { element, doc } = fixture();
    const done = vi.fn();
    doc.documentElement.dataset.motionResolved = "reduced";
    expect(animateMotion(element, [], { onFinish: done })).toBeNull();
    expect(element.animate).not.toHaveBeenCalled();
    doc.documentElement.dataset.motionResolved = "full";
    element.animate = undefined as unknown as HTMLElement["animate"];
    expect(animateMotion(element, [], { onFinish: done })).toBeNull();
    expect(done).toHaveBeenCalledTimes(2);
  });

  it("bounds retargeting by the current profile and remaining deadline", () => {
    const { element, animations } = fixture();
    animateMotion(element, [], { duration: 40 });
    expect(animations[0].options.duration).toBe(40);
    animateMotion(element, [], { duration: 900 });
    expect(animations[1].options.duration).toBe(200);
    const done = vi.fn();
    expect(animateMotion(element, [], { duration: -1, onFinish: done })).toBeNull();
    expect(done).toHaveBeenCalledOnce();
  });
});
