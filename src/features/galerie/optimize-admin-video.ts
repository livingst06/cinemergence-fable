import {
  BlobSource,
  BufferTarget,
  Conversion,
  Input,
  MP4,
  Mp4OutputFormat,
  Output,
  QTFF,
  Quality,
  WEBM,
} from "mediabunny";

import { ADMIN_GALLERY_VIDEO_MAX_BYTES } from "@/lib/admin-gallery-upload";
import {
  ADMIN_AUDIO_QUALITY,
  ADMIN_VIDEO_MAX_FPS,
  ADMIN_VIDEO_QUALITY,
  OPTIMIZED_VIDEO_MIME,
  fitAdminVideoSize,
  interviewVideoOptimizeError,
} from "@/lib/optimize-admin-video";

export type OptimizeAdminVideoProgress = (percent: number) => void;

function assertWebCodecs(): void {
  if (typeof VideoEncoder === "undefined" || typeof VideoDecoder === "undefined") {
    throw new Error(
      "Ce navigateur ne peut pas compresser la vidéo. Ouvre Chrome, Edge ou Safari.",
    );
  }
}

function optimizedFileName(originalName: string): string {
  const base = originalName.replace(/\.[^.]+$/, "").trim() || "interview";
  return `${base}.mp4`;
}

async function convertInterviewVideo(
  file: File,
  preferSpecificCodecs: boolean,
  onProgress?: OptimizeAdminVideoProgress,
): Promise<File> {
  const input = new Input({
    formats: [MP4, QTFF, WEBM],
    source: new BlobSource(file),
  });
  const target = new BufferTarget();
  const output = new Output({
    format: new Mp4OutputFormat({ fastStart: "in-memory" }),
    target,
  });

  const conversion = await Conversion.init({
    input,
    output,
    tracks: "primary",
    showWarnings: false,
    video: async (track) => {
      const size = fitAdminVideoSize(
        await track.getDisplayWidth(),
        await track.getDisplayHeight(),
      );
      let frameRate: number | undefined;
      try {
        const fps = (await track.computeFrameRateMetrics({ targetPacketCount: 64 }))
          .bestGuessFrameRate;
        if (fps > ADMIN_VIDEO_MAX_FPS) frameRate = ADMIN_VIDEO_MAX_FPS;
      } catch {
        // garde le framerate source si le sondage échoue
      }
      return {
        width: size.width,
        height: size.height,
        fit: "contain",
        quality: new Quality(ADMIN_VIDEO_QUALITY),
        forceTranscode: true,
        keyFrameInterval: 4,
        hardwareAcceleration: "prefer-hardware",
        allowRotationMetadata: false,
        ...(frameRate ? { frameRate } : {}),
        ...(preferSpecificCodecs ? { codec: "avc" as const } : {}),
      };
    },
    audio: async (track) => ({
      quality: new Quality(ADMIN_AUDIO_QUALITY),
      forceTranscode: true,
      numberOfChannels: Math.min(2, await track.getNumberOfChannels()),
      ...(preferSpecificCodecs ? { codec: "aac" as const } : {}),
    }),
  });

  if (!conversion.isValid) {
    const blocking = conversion.discardedTracks.find((item) =>
      item.track.isVideoTrack(),
    );
    throw new Error(interviewVideoOptimizeError(blocking?.reason ?? "invalid"));
  }

  const lostAudio = conversion.discardedTracks.find(
    (item) =>
      item.track.isAudioTrack() &&
      (item.reason === "undecodable_source_codec" ||
        item.reason === "no_encodable_target_codec" ||
        item.reason === "unknown_source_codec"),
  );
  if (lostAudio) {
    throw new Error(interviewVideoOptimizeError(lostAudio.reason));
  }

  conversion.onProgress = (progress) => {
    onProgress?.(Math.min(99, Math.round(progress * 100)));
  };

  await conversion.execute();
  onProgress?.(100);

  const buffer = target.buffer;
  if (!buffer || buffer.byteLength < 1) {
    throw new Error("Optimisation vidéo : fichier vide");
  }
  if (buffer.byteLength > ADMIN_GALLERY_VIDEO_MAX_BYTES) {
    throw new Error("Vidéo trop volumineuse après compression (max 2 Go)");
  }

  return new File([buffer], optimizedFileName(file.name), {
    type: OPTIMIZED_VIDEO_MIME,
    lastModified: Date.now(),
  });
}

/**
 * Re-encode une interview admin avant upload S3 : 720p, H.264/AAC, MP4 faststart.
 */
export async function optimizeAdminVideo(
  file: File,
  onProgress?: OptimizeAdminVideoProgress,
): Promise<File> {
  assertWebCodecs();
  try {
    return await convertInterviewVideo(file, true, onProgress);
  } catch (firstError) {
    const message = firstError instanceof Error ? firstError.message : "";
    if (/fichier vide|trop volumineuse/i.test(message)) {
      throw firstError;
    }
    try {
      return await convertInterviewVideo(file, false, onProgress);
    } catch {
      throw firstError instanceof Error
        ? firstError
        : new Error("Optimisation vidéo impossible");
    }
  }
}
