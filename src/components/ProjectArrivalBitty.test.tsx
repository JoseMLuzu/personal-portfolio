import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectArrivalBitty } from "./ProjectArrivalBitty";

const animation = vi.hoisted(() => ({ animate: vi.fn(), stop: vi.fn(), reduced: false }));
vi.mock("motion/react", async (importOriginal) => {
  const original = await importOriginal<typeof import("motion/react")>();
  const { useRef } = await import("react");
  return {
    ...original,
    useReducedMotion: () => animation.reduced,
    useAnimate: () => [useRef(null), animation.animate],
  };
});

let enterViewport: (entries: { isIntersecting: boolean }[]) => void;

beforeEach(() => {
  animation.reduced = false;
  animation.animate.mockReset();
  animation.stop.mockReset();
  animation.animate.mockImplementation(() => Object.assign(Promise.resolve(), { stop: animation.stop }));
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: typeof enterViewport) { enterViewport = callback; }
    observe() {}
    disconnect() {}
  });
  vi.stubGlobal("Image", class {
    onload?: () => void;
    set src(_value: string) { queueMicrotask(() => this.onload?.()); }
  });
});

afterEach(() => vi.unstubAllGlobals());

describe("Bitty project arrival", () => {
  it("waits for the viewport, supports replay, and stops its timeline on unmount", async () => {
    const { unmount } = render(<ProjectArrivalBitty />);
    const replay = screen.getByRole("button", { name: "Repetir la llegada de Bitty" });
    expect(replay).toBeDisabled();
    await act(async () => { enterViewport([{ isIntersecting: false }]); });
    expect(animation.animate).not.toHaveBeenCalled();
    await act(async () => { enterViewport([{ isIntersecting: true }]); });
    await waitFor(() => expect(replay).toBeEnabled());
    expect(animation.animate).toHaveBeenCalledTimes(1);
    fireEvent.click(replay);
    await waitFor(() => expect(animation.animate).toHaveBeenCalledTimes(2));
    unmount();
    expect(animation.stop).toHaveBeenCalledTimes(2);
  });

  it("shows the final pose immediately without a timeline for reduced motion", () => {
    animation.reduced = true;
    const { container } = render(<ProjectArrivalBitty />);
    expect(container.querySelector(".project-arrival")).toHaveClass("is-static", "is-landed");
    expect(animation.animate).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Repetir la llegada de Bitty" })).toBeDisabled();
  });
});
