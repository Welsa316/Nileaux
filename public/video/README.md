# Hero video

Source: `~/Downloads/Aerial_view_of_river_delta_20261004021258.mp4` (H.264, 1920×1080, 24 fps,
8 s). The source has a single keyframe at 0 s, which makes scroll scrubbing choppy because
every seek decodes from the first frame.

- `delta-dusk-1080.mp4` and `delta-dusk-540.mp4` are derived encodes for scrubbing: a
  keyframe every 6 frames, no B-frames, no audio, faststart. Regenerate with:

      ffmpeg -i SOURCE.mp4 -an -c:v libx264 -profile:v high -pix_fmt yuv420p -preset slow \
        -crf 19 -g 6 -keyint_min 6 -sc_threshold 0 -bf 0 -movflags +faststart delta-dusk-1080.mp4

- `delta-dusk-poster*.jpg` are frame 0 of the source, used as the poster and the
  reduced-motion still.
