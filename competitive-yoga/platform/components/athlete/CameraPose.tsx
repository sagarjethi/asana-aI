"use client";

/**
 * CameraPose — self-contained live webcam pose capture for the athlete journeys.
 *
 * Opens the user's webcam, lazily loads the MoveNet detector (lib/pose/detector),
 * runs a requestAnimationFrame estimate loop, draws a live skeleton overlay, keeps
 * a rolling buffer of recent PoseFrames, and hands a captured buffer to onScore.
 *
 * SSR-safe: nothing touches navigator/window/TF at module top level — only inside
 * effects and event handlers. TF stays lazy via createDetector().
 */
import * as React from "react";
import type { PoseFrame, JointName } from "@/lib/contracts";
import { createDetector, toKeypoints } from "@/lib/pose/detector";
import { meanConfidence } from "@/lib/pose";
import { Button, Card } from "@/components/ui";

/** Standard limb pairs for the skeleton overlay. */
const SKELETON: ReadonlyArray<[JointName, JointName]> = [
  ["left_shoulder", "right_shoulder"],
  ["left_shoulder", "left_elbow"],
  ["left_elbow", "left_wrist"],
  ["right_shoulder", "right_elbow"],
  ["right_elbow", "right_wrist"],
  ["left_shoulder", "left_hip"],
  ["right_shoulder", "right_hip"],
  ["left_hip", "right_hip"],
  ["left_hip", "left_knee"],
  ["left_knee", "left_ankle"],
  ["right_hip", "right_knee"],
  ["right_knee", "right_ankle"],
];

const KP_SCORE_THRESHOLD = 0.3;
const BUFFER_SIZE = 60;
const MIN_GOOD_FRAMES = 15;
/** A "good" frame is one the detector is reasonably confident about. */
const GOOD_FRAME_CONFIDENCE = 0.3;

type Phase = "idle" | "starting" | "loading-model" | "live" | "error";

export interface CameraPoseProps {
  templateId: string;
  onScore: (frames: PoseFrame[]) => void | Promise<void>;
  busy?: boolean;
  ctaLabel?: string;
}

function describeMediaError(err: unknown): string {
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return "Camera needs a secure context (https or localhost). Open this page over https.";
  }
  if (err instanceof DOMException) {
    switch (err.name) {
      case "NotAllowedError":
      case "SecurityError":
        return "Camera permission was denied. Allow camera access in your browser, then try again.";
      case "NotFoundError":
      case "DevicesNotFoundError":
        return "No camera found. Connect a webcam and try again.";
      case "NotReadableError":
        return "Your camera is already in use by another app. Close it and try again.";
      default:
        return err.message || "Could not start the camera.";
    }
  }
  if (err instanceof Error) return err.message;
  return "Could not start the camera.";
}

export function CameraPose({ templateId, onScore, busy, ctaLabel }: CameraPoseProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  // Mutable runtime refs (avoid re-renders inside the RAF loop).
  const streamRef = React.useRef<MediaStream | null>(null);
  const detectorRef = React.useRef<any>(null);
  const rafRef = React.useRef<number | null>(null);
  const startTimeRef = React.useRef<number>(0);
  const bufferRef = React.useRef<PoseFrame[]>([]);

  const [phase, setPhase] = React.useState<Phase>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [live, setLive] = React.useState<{ confidence: number; joints: number }>({
    confidence: 0,
    joints: 0,
  });
  const [hint, setHint] = React.useState<string | null>(null);

  // Full teardown — safe to call multiple times.
  const stop = React.useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
      streamRef.current = null;
    }
    const video = videoRef.current;
    if (video) video.srcObject = null;
    const det = detectorRef.current;
    if (det && typeof det.dispose === "function") {
      try {
        det.dispose();
      } catch {
        /* ignore dispose errors */
      }
    }
    detectorRef.current = null;
    bufferRef.current = [];
  }, []);

  // Cleanup on unmount.
  React.useEffect(() => stop, [stop]);

  const drawOverlay = React.useCallback((keypoints: PoseFrame["keypoints"]) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return;
    if (canvas.width !== vw) canvas.width = vw;
    if (canvas.height !== vh) canvas.height = vh;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, vw, vh);

    const byName = new Map<JointName, PoseFrame["keypoints"][number]>();
    for (const kp of keypoints) byName.set(kp.name, kp);

    // Limb connections.
    ctx.lineWidth = Math.max(2, vw / 200);
    ctx.strokeStyle = "rgba(234, 88, 12, 0.85)"; // sun-600-ish
    for (const [a, b] of SKELETON) {
      const ka = byName.get(a);
      const kb = byName.get(b);
      if (!ka || !kb) continue;
      if (ka.score < KP_SCORE_THRESHOLD || kb.score < KP_SCORE_THRESHOLD) continue;
      ctx.beginPath();
      ctx.moveTo(ka.x, ka.y);
      ctx.lineTo(kb.x, kb.y);
      ctx.stroke();
    }

    // Keypoint dots.
    const r = Math.max(3, vw / 150);
    ctx.fillStyle = "rgba(251, 191, 36, 0.95)"; // amber
    for (const kp of keypoints) {
      if (kp.score < KP_SCORE_THRESHOLD) continue;
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  const loop = React.useCallback(() => {
    const video = videoRef.current;
    const detector = detectorRef.current;
    // Skip work when the tab is hidden or we are not ready.
    if (
      typeof document !== "undefined" &&
      document.hidden
    ) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }
    if (!video || !detector || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }

    detector
      .estimatePoses(video)
      .then((poses: any[]) => {
        const pose = poses?.[0];
        if (pose) {
          const keypoints = toKeypoints(pose);
          const frame: PoseFrame = {
            t: Math.round(performance.now() - startTimeRef.current),
            keypoints,
            confidence: 0,
          };
          frame.confidence = meanConfidence(frame);

          const buf = bufferRef.current;
          buf.push(frame);
          if (buf.length > BUFFER_SIZE) buf.shift();

          drawOverlay(keypoints);
          const detected = keypoints.filter((k) => k.score >= KP_SCORE_THRESHOLD).length;
          setLive({ confidence: frame.confidence, joints: detected });
        }
      })
      .catch(() => {
        /* transient estimate errors are non-fatal; keep looping */
      })
      .finally(() => {
        rafRef.current = requestAnimationFrame(loop);
      });
  }, [drawOverlay]);

  const start = React.useCallback(async () => {
    setError(null);
    setHint(null);
    setPhase("starting");
    try {
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        throw new Error("This browser does not support camera access.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        // Component unmounted mid-request.
        for (const t of stream.getTracks()) t.stop();
        return;
      }
      video.srcObject = stream;
      await video.play().catch(() => {
        /* autoplay may resolve via the muted/playsInline attrs */
      });

      setPhase("loading-model");
      const detector = await createDetector();
      // Guard against unmount/stop during the async model load.
      if (!streamRef.current) {
        if (detector && typeof detector.dispose === "function") detector.dispose();
        return;
      }
      detectorRef.current = detector;

      startTimeRef.current = performance.now();
      bufferRef.current = [];
      setPhase("live");
      rafRef.current = requestAnimationFrame(loop);
    } catch (err) {
      stop();
      setError(describeMediaError(err));
      setPhase("error");
    }
  }, [loop, stop]);

  const capture = React.useCallback(async () => {
    setHint(null);
    const good = bufferRef.current.filter((f) => f.confidence >= GOOD_FRAME_CONFIDENCE);
    if (good.length < MIN_GOOD_FRAMES) {
      setHint(
        `Hold the pose steady so the camera can see you — captured ${good.length}/${MIN_GOOD_FRAMES} clear frames.`,
      );
      return;
    }
    // Snapshot the current buffer so it can't mutate mid-submit.
    await onScore(good.slice());
  }, [onScore]);

  const modelLoading = phase === "starting" || phase === "loading-model";

  return (
    <Card className="rounded-2xl">
      <div className="relative overflow-hidden rounded-xl border border-sun-200/70 bg-stone-900/90">
        {/* Mirror the feed so it reads like a mirror; overlay shares the transform. */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="block h-auto w-full -scale-x-100"
        />
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full -scale-x-100"
        />

        {phase !== "live" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-stone-900/70 p-6 text-center">
            {phase === "idle" ? (
              <>
                <p className="text-sm text-paper/90">
                  Use your webcam for a real take. Nothing leaves your device — pose detection
                  runs in your browser.
                </p>
                <Button onClick={start}>Start camera</Button>
              </>
            ) : null}
            {modelLoading ? (
              <p className="animate-pulse text-sm text-paper/90">
                {phase === "starting" ? "Starting camera…" : "Loading pose model…"}
              </p>
            ) : null}
            {phase === "error" ? (
              <>
                <p className="text-sm font-medium text-red-200">{error}</p>
                <Button variant="secondary" onClick={start}>
                  Try again
                </Button>
              </>
            ) : null}
          </div>
        ) : null}

        {phase === "live" ? (
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-stone-900/70 px-3 py-1 text-xs font-medium text-paper">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
            Live · {Math.round(live.confidence * 100)}% conf · {live.joints} joints
          </div>
        ) : null}
      </div>

      {hint ? <p className="mt-3 text-sm text-amber-700">{hint}</p> : null}

      {phase === "live" ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button size="lg" disabled={busy} onClick={capture}>
            {busy ? "Scoring…" : (ctaLabel ?? "Capture & score")}
          </Button>
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => {
              stop();
              setLive({ confidence: 0, joints: 0 });
              setPhase("idle");
            }}
          >
            Stop camera
          </Button>
          <span className="text-xs text-stone-500" aria-hidden>
            Asana: {templateId}
          </span>
        </div>
      ) : null}
    </Card>
  );
}

export default CameraPose;
