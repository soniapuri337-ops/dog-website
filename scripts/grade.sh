#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Rescue story pipeline
#   raw/*.mp4  ->  graded/*.mp4  ->  graded/master_raw.mp4  ->  public/hero/*
#
#   1. crop the Gemini watermark out of the bottom right, then scale back to a
#      full 1920x1080 frame
#   2. apply the bright, airy grade
#   3. join the seven clips with 0.4s crossfades so no seam reads as a cut
#   4. encode web variants with dense keyframes for scroll scrubbing
#
# Run from anywhere:  bash scripts/grade.sh
# ---------------------------------------------------------------------------
set -euo pipefail
cd "$(dirname "$0")/.."

CLIPS="01-found 02-rescue 03-trust 04-care 05-nourish 06-bond 07-home"
XFADE=0.4

# The watermark sits at roughly x 1725..1920, y 860..1040 on a 1920x1080 frame,
# which is about 11 percent in from the right. A 6 percent crop leaves it on
# screen. 1664x936 is the largest exact 16:9 box that clears it with margin to
# spare, and scaling back to 1920x1080 keeps the framing full bleed.
CROP="crop=1664:936:0:0,scale=1920:1080"
GRADE="eq=contrast=1.05:saturation=1.1:brightness=0.03,hqdn3d=2:1:2:2,unsharp=5:5:0.5,vignette=PI/7"

mkdir -p graded public/hero

echo "==> 1/4  grading seven clips"
for f in $CLIPS; do
  echo "    $f"
  ffmpeg -y -loglevel error -i "raw/$f.mp4" -vf "$CROP,$GRADE" -r 30 \
    -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -an "graded/$f.mp4"
done

echo "==> 2/4  master with ${XFADE}s crossfade joins"
: > graded/list.txt
for f in $CLIPS; do echo "file '$f.mp4'" >> graded/list.txt; done

inputs=(); filter=""; prev="[0:v]"; acc=0; i=0
for f in $CLIPS; do
  inputs+=(-i "graded/$f.mp4")
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "graded/$f.mp4")
  if [ $i -eq 0 ]; then
    acc=$d
  else
    off=$(awk -v a="$acc" -v x="$XFADE" 'BEGIN{printf "%.3f", a-x}')
    filter="${filter}${prev}[${i}:v]xfade=transition=fade:duration=${XFADE}:offset=${off}[v${i}];"
    prev="[v${i}]"
    acc=$(awk -v a="$acc" -v d="$d" -v x="$XFADE" 'BEGIN{printf "%.3f", a+d-x}')
  fi
  i=$((i+1))
done
filter="${filter%;}"
echo "    master duration ~= ${acc}s  (keep src/data/site.js seconds in sync)"
ffmpeg -y -loglevel error "${inputs[@]}" -filter_complex "$filter" -map "$prev" \
  -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -an graded/master_raw.mp4

echo "==> 3/4  web encodes"
# Desktop. Dense keyframes so a scroll seek never has far to decode back to.
echo "    master.mp4          1600x900"
ffmpeg -y -loglevel error -i graded/master_raw.mp4 -vf "scale=1600:900" \
  -c:v libx264 -crf 27 -preset slow -g 10 -keyint_min 10 -sc_threshold 0 \
  -pix_fmt yuv420p -movflags +faststart -an public/hero/master.mp4

# Phones. A native 9:16 centre cut, not a downscaled 16:9 file: a portrait
# viewport shows only the middle quarter of a wide frame, so cropping at encode
# time means every bit that ships is a bit you can actually see. The centre cut
# sits well clear of the old watermark corner.
echo "    master-mobile.mp4   608x1080 native portrait"
ffmpeg -y -loglevel error -i graded/master_raw.mp4 -vf "crop=608:1080:656:0" \
  -c:v libx264 -crf 28 -preset slow -g 8 -keyint_min 8 -sc_threshold 0 \
  -pix_fmt yuv420p -movflags +faststart -an public/hero/master-mobile.mp4

echo "    master.webm         1280x720 vp9"
ffmpeg -y -loglevel error -i graded/master_raw.mp4 -vf "scale=1280:720" \
  -c:v libvpx-vp9 -crf 36 -b:v 0 -g 10 -keyint_min 10 -row-mt 1 \
  -deadline good -cpu-used 4 -an public/hero/master.webm

echo "==> 4/4  posters"
ffmpeg -y -loglevel error -i public/hero/master.mp4 -frames:v 1 -q:v 3 public/hero/poster.jpg
ffmpeg -y -loglevel error -i public/hero/master-mobile.mp4 -frames:v 1 -q:v 3 public/hero/poster-mobile.jpg

echo "==> done"
ls -la public/hero
