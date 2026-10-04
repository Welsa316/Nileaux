# Hero video

Source: `~/Downloads/385caca9-8377-4790-b1a5-d199fffcf871.mp4` (H.264, 3840×2160, 24 fps,
10 s, keyframe every second). Sparse keyframes make scroll scrubbing choppy because every
seek decodes forward from the previous keyframe, so the files here are derived encodes.

- `delta-dusk-2160.mp4` (3840×2160, crf 24), `delta-dusk-1440.mp4` (2560×1440),
  `delta-dusk-1080.mp4` (1920×1080) and `delta-dusk-540.mp4` (960×540): keyframe every 6
  frames, no B-frames, no audio, faststart. The hero picks by device pixels: 2160 on dense
  screens from 1100 CSS px wide, 1440 on dense screens below that or standard screens from
  1500 px, 1080 otherwise, 540 on phones.
  Regenerate with:

      ffmpeg -i SOURCE.mp4 -an -vf "scale=1920:-2" -c:v libx264 -profile:v high -pix_fmt yuv420p \
        -preset slow -crf 22 -g 6 -keyint_min 6 -sc_threshold 0 -bf 0 -movflags +faststart delta-dusk-1080.mp4

- `delta-dusk-poster*.jpg` (2560, 1920 and 960 wide) are frame 0 of the source, used as
  the poster and the reduced-motion still.
