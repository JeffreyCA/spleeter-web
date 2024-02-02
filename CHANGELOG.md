# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [v3.20.1] - 2024-02-01

### Changed
- Fix regression where first-time Spleeter model download fails due to `httpx` not following redirects (#949) - thanks [@microtherion](https://github.com/microtherion) for the fix!
- Add cleanup logic to remove leftover model files from failed download attempts
- Update dependencies

## [v3.20.0] - 2024-01-13

### Added
- Add Docker support for AArch64 systems (including Apple Silicon)

### Changed
- Update Docker Python version to 3.9
- Update Docker CUDA image version to 11.6.1
- Update dependencies


## [v3.19.0] - 2023-09-24

### Added
- Add 2 environment variables for configuring `yt-dlp`:
  - `YOUTUBEDL_SOURCE_ADDR` - Client-side IP address for `yt-dlp` to bind to. If you are facing 403 Forbidden errors, try setting this to `0.0.0.0` to force all connections through IPv4
  - `YOUTUBEDL_VERBOSE` - Set to `1` to enable verbose logging for `yt-dlp`
- Add download button on music player

### Changed
- Update dependencies


## [v3.18.0] - 2023-07-01

### Added
- Add `AWS_S3_REGION_NAME` and `AWS_S3_SIGNATURE_VERSION` variables for S3 integration
- Add more descriptive error logging

### Changed
- Allow multiple `CERTBOT_DOMAIN`s and hardcode cert-name to 'spleeter-web' (#533)
- Fix bug where separation would fail immediately (#672)
- Update GPU Docker base image to `cuda:11.2.2` from `cuda:11.2.0` due to deprecation
- Update dependencies


## [v3.17.0] - 2023-01-11

### Added
- Support Spleeter's 5-stem model which separates piano in addition to other accompaniment

### Changed
- Update separator form UI to use buttons instead of dropdown menus
- Improve form field validation
- Bring back 'iterations' param for X-UMX model
- Update dependencies
- Fix Dev Docker Compose config
- Fix bug where deleting dynamic mix may cause blank screen

### Removed
- Remove frontend upload size check and rely on Nginx and backend instead


## [v3.16.0] - 2022-12-26

### Added
- Support lossless output formats (WAV, FLAC)
- Add `UPLOAD_FILE_SIZE_LIMIT` (in MB) and `YOUTUBE_LENGTH_LIMIT` (in minutes) environment variables to customize upload limits


## [v3.15.0] - 2022-12-11

### Added
- Update Demucs to v4, which features new Hybrid Transformer models with average SDR of 9.0
     - [More info](https://github.com/facebookresearch/demucs/blob/main/docs/release.md#v400-7th-of-december-2022)
- Add ability to configure segment sizes for Demucs models
    - If Demucs separation fails for you due insufficient GPU memory, try setting the environment variable `DEMUCS_SEGMENT_SIZE` to a lower value like `10` (default is `40`, which requires a around 7 GB of memory). You may have to experiment a bit to find the appropriate value. See [this](https://github.com/facebookresearch/demucs#memory-requirements-for-gpu-acceleration) for more info.
    - Also try setting `PYTORCH_NO_CUDA_MEMORY_CACHING=1` to disable caching

### Changed
- Update Docker Compose definitions from version `3.4` to [Compose Specification](https://docs.docker.com/compose/compose-file/)
    - You may have to update your Docker Compose version to the newer version


## [v3.14.0] - 2022-09-08

### Changed
- Raise minimum Python version to 3.8 and NodeJS version to 16
- Update Docker images to use Python 3.8 and NodeJS 16 (bullseye)
- Update Spleeter, Demucs, Tensorflow, and other dependencies

### Removed
- Remove some unused NPM dependencies

## [v3.13.0] - 2022-06-23

### Changed
- Update dependencies
- Docker: start Django server using 'api' instead of 0.0.0.0 as bind address

### Added
- Support for RTX GPUs - Thanks @Ma5onic! (#142)
- HTTPS support using [docker-nginx-certbot](https://github.com/JonasAlfredsson/docker-nginx-certbot).
    - To use HTTPS, set `APP_HOST` to your domain name and `CERTBOT_EMAIL` to your email in `.env` and include `-f docker-compose.https.yml` in your `docker-compose up` command.
- Add ability to export Dynamic Mixes based on each component's volume levels.
    - To enable this feature, set `ENABLE_CROSS_ORIGIN_HEADERS=1` in `.env` and either access Spleeter Web at `localhost` or enable HTTPS on your domain (see above). This is because it uses [SharedArrayBuffers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements) which require cross-origin isolation.
        - If using an external storage provider, you'll need to set the `Cross-Origin-Resource-Policy` response headers to `cross-origin`. See [this](https://web.dev/coop-coep/) for more details.
    - All the exporting is done in-browser using [FFmpeg.WASM](https://github.com/ffmpegwasm/ffmpeg.wasm).
    - Sidenote: Spleeter Web uses a [forked version](https://github.com/JeffreyCA/ffmpeg.wasm-core) with some cherry-picked changes from the main FFmpeg repo pertaining to the `amix` filter.


## [v3.12.0] - 2022-02-21

### Changed
- Update X-UMX and D3Net models to latest version
- Fix bug where status icon overlay sometimes disappears
- Fix bug where adding basic auth in front of nginx breaks the app (credit to @jtagcat)
- Update dependencies

### Added
- Add `API_HOST` environment variable to control hostname of API server for nginx (credit to @jtagcat)
- Show datetime when fetch task or separation task finished on status icon hover
- Model file integrity checks for X-UMX and D3Net models
- Add support for accelerated CPU separation for D3Net using OpenVINO
    - To enable, set `D3NET_OPENVINO` environment variable to `1` and `D3NET_OPENVINO_THREADS` to number of CPU threads to use

### Removed
- Prune unused pip dependencies


## [v3.11.0] - 2021-12-17

### Changed
- Update Demucs to v3, which uses hybrid separation approach resulting in much improved performance
    - [Official Demucs changelog](https://github.com/facebookresearch/demucs/blob/main/docs/release.md)
- Fix bug where non-Spleeter models always generated 128kbps MP3 files. Oops!
- Update "Getting Started" section in README to use prod configuration
- Update some dependencies

### Removed
- Tasnet models
- Ability to separate using older Demucs models


## [v3.10.0] - 2021-11-01

### Changed
- D3Net - Fix "Unable to open file (file signature not found)" error
- D3Net - Fix separation when using local file storage
- Make `DEFAULT_FILE_STORAGE` an environment variable. It can be set to `FILE`, `AWS`, or `AZURE`. More information in `README.md`.
    - Set the default to `FILE` in all cases
- Apply workaround for DNS issue on Docker for Windows


## [v3.9.0] - 2021-10-09

### Changed
- Update Spleeter to 2.3.0 (which uses Tensorflow 2.5.0)
- Update GPU Dockerfile to use CUDA 11.2.0/cuDNN8 and latest nnabla package
- Switch from youtube_dl (inactive project) to yt_dlp which fixes slow YouTube download speeds
- Fix issue with using Docker on Windows where YouTube videos would not download
- Update dependencies


## [v3.8.0] - 2021-06-25

### Added
- Docker: Add environment variables `DEV_WEBSERVER_PORT` and `NGINX_PORT` to configure which ports to use on host machine for webserver

### Removed
- Docker: Unexpose Redis port `6379` on host machine


## [v3.7.0] - 2021-06-21

### Added
- Support for D3Net model! Big thanks to Sony AI Research for making it [open-source](https://github.com/sony/ai-research-code/tree/master/d3net) ([paper](https://arxiv.org/abs/2010.01733)).

### Changed
- Fix GPU Docker image so that GPU-accelerated separation works properly with Spleeter
- Update `youtube-dl`
- Fix YouTube metadata parsing on certain types of videos


## [v3.6.1] - 2021-06-14

### Changed
- Add back Demucs Light variant mapping
- Update more dependencies (security fixes)


## [v3.6.0] - 2021-06-13

### Changed
- Update Demucs to v2, which offers higher quality separations and smaller models
- Allow all hosts when running in dev mode
- Update dependencies


## [v3.5.2] - 2021-04-16

### Changed
- Update dependencies


## [v3.5.1] - 2021-02-15

### Changed
- Suppress discovery_cache warnings related to YouTube data API calls
- Update dependencies


## [v3.5.0] - 2021-02-07
### Added
- Ability to download individual parts of a dynamic mix

### Changed
- Action buttons appear greyed out after pressed while waiting for backend API response


## [v3.4.0] - 2021-02-06
### Added
- Support additional audio formats
    - Full list: `.aac, .aif, .aifc, .aiff, .flac, .m4a, .mogg, .mp3, .oga, .ogg, .opus, .wav, .weba, .webm`
- Ability to edit source track artist and title information
    - In the song table, just click on the cell to edit its value. Then press `enter` or click elsewhere to save.

### Changed
- Improve YouTube link parsing logic
- Increase max file size upload limit to 100 MB
    - You can override this by changing `UPLOAD_FILE_SIZE_LIMIT` in `settings.py/settings_docker.py` and `MAX_FILE_BYTES` in `Constants.tsx`
- Increase max YouTube video length to 30 minutes
    - You can override this by changing `YOUTUBE_LENGTH_LIMIT` in `settings.py/settings_docker.py`
- Update Node dependencies


## [v3.3.1] - 2021-01-30
### Changed
- Fix bug where Spleeter static mixes would fail


## [v3.3.0] - 2021-01-18
### Added
- Support X-UMX CPU separation

### Changed
- Make dynamic mix player timestamp more consistent


## [v3.2.0] - 2021-01-17
### Added
- Solo track functionality to dynamic mixer
- Keyboard controls for dynamic mixer
    - Play/pause: `spacebar`
    - Mute/unmute: `1/2/3/4`
    - Solo/unsolo: `Q/W/E/R` (hold either `Ctrl/Cmd/Shift` to solo/unsolo multiple parts)

### Changed
- Pressing space bar on home page should play/pause current track without scrolling to bottom
- Spleeter: Update to v2.1.2
- Spleeter: use `STFTBackend.LIBROSA` for CPU separation and `STFTBackend.TENSORFLOW` for GPU separation


## [v3.1.1] - 2021-01-14
### Changed
- Update `react-music-player` with bug fixes


## [v3.1.0] - 2021-01-13
### Added
- Environment variables to support custom domains such as for CDNs

### Changed
- Use "title - artist" format everywhere
- Update `react-music-player` to use non-linear volume slider and gradual fade-ins/fade-outs
- Update dependencies


## [v3.0.0] - 2021-01-08
### Added
- GPU-enabled Docker images (CUDA 10, CUDNN 7) which can accelerate separation process
    - Use `docker-compose.gpu.yml` and `docker-compose.build.gpu.yml` instead of `docker-compose.yml` and `docker-compose.build.yml` for GPU images
    - See [updated instructions](https://github.com/JeffreyCA/spleeter-web#instructions) for more info
    - Tested on NC6 Promo Azure VM
- Support for Sony AI's [CrossNet-Open-Unmix (X-UMX)](https://github.com/sony/ai-research-code/tree/master/x-umx#crossnet-open-unmix-x-umx) source separation model (NNabla implementation). At the moment it only works with GPU, not CPU. [#52](https://github.com/JeffreyCA/spleeter-web/issues/52) tracks this issue.
    - User configurable parameters: number of iterations, softmask, softmask alpha
- Custom bitrates (MP3 CBR) for static and dynamic mixes at: 192 kbps, 256 kbps, and 320 kbps

### Changed
- Improved dynamic mix processing times by parallelizing the MP3 export process
- Reduced memory consumption of Demucs/Tasnet models by using splitting
- Update dependencies

### Removed
- Overwrite option for static mixes (you can always delete specific mixes)


## [v2.0.1] - 2020-12-30
### Changed
- Indent mix table to make it easier to see
- Update Demucs dependency


## [v2.0.0] - 2020-12-29
### Added
- Support for Facebook Research's [Demucs and Tasnet](https://github.com/facebookresearch/demucs) source separation models, including "light" and "extra" variants
    - Demucs and Tasnet models have a "random split" parameter that can help improve separation quality
- New labels to indicate the model and parameters used to generate a mix
- New refresh button that also indicates the time remaining until next auto-refresh
- Add brief fade-in and fade-out to dynamic mix player
- Show separator badge in music player

### Changed
- Dynamic mixes now appear as part of the mix table
- Use more descriptive and cleaner file naming scheme for generated files
- Minor touch-ups to overall interface
- Fix bug where sort order of mix table gets reset after a few seconds
- Fix "'ContentDisposition' is an invalid key" error when writing to Azure storage
- Fix bug where music player timestamp would show "00:60" instead of "01:00"
- Fix blank status badge


## [v1.2.0] - 2020-12-22
### Added
- New configurable settings for using AWS S3 as backend for serving media files
- A favicon

### Changed
- Files uploaded to Azure Storage have `Content-Disposition` always set to `attachment`
- Fix issue with Dynamic Mixes where seeking occurs after long delay

### Removed
- `psycopg2` Python dependency


## [v1.1.0] - 2020-12-20
### **Breaking Changes for Docker**
- Change database backend from PostgreSQL to SQLite
    - **If you are updating from a previous version, please backup your track list as the data in the DB will not carry over after updating! Your media files will not be impacted.**

### Added
- On dynamic mix pages, the tab title shows the current track information

### Changed
- Dynamic mix files are now saved as: `artist-title-part.mp3` instead of `part.mp3`
- Correct service name in `docker-compose.prod.selfhost.yml`
- Use separate Celery queues for fast (YouTube imports) and slow (source separation) tasks
    - For Docker, the fast and slow Celery workers run in separate containers
- Update dependencies


## [v1.0.0] - 2020-12-19
### Added
- Ability to delete individual static mixes
- Ability to delete source tracks and mixes while task is still in-progress
- Ability to cancel in-progress dynamic mix task
- New status icon column in the Track List table
- New requirement for Redis
- Make `AZURE_CONTAINER` a configurable environment variable

### Changed
- Fix bug where dynamic mix tracks may never finish loading
- Dynamic mixes open in new tab
- Change file deletion logic to also delete empty parent directories
- Make the "external link" icon a button in the YouTube search result list
- Switch from Huey to Celery for the task queue
    - Celery allows terminating in-progress tasks
- Increase `YOUTUBE_LENGTH_LIMIT` to `20`
- Decrease API polling frequency to 5 seconds
- Update Spleeter to 2.0.2 (Python 3.8 now supported)
- Update Python and npm dependencies
- Update Docker images

### Removed
- Periodic cleanup task


## [Pre-release] - before 2020-12
Undocumented


[Unreleased]: https://github.com/JeffreyCA/spleeter-web/compare/v3.20.1...HEAD
[v3.20.1]: https://github.com/JeffreyCA/spleeter-web/compare/v3.20.0...v3.20.1
[v3.20.0]: https://github.com/JeffreyCA/spleeter-web/compare/v3.19.0...v3.20.0
[v3.19.0]: https://github.com/JeffreyCA/spleeter-web/compare/v3.18.0...v3.19.0
[v3.18.0]: https://github.com/JeffreyCA/spleeter-web/compare/v3.17.0...v3.18.0
[v3.17.0]: https://github.com/JeffreyCA/spleeter-web/compare/v3.16.0...v3.17.0
[v3.16.0]: https://github.com/JeffreyCA/spleeter-web/compare/v3.15.0...v3.16.0
[v3.15.0]: https://github.com/JeffreyCA/spleeter-web/compare/v3.14.0...v3.15.0
[v3.14.0]: https://github.com/JeffreyCA/spleeter-web/compare/v3.13.0...v3.14.0
[v3.13.0]: https://github.com/JeffreyCA/spleeter-web/compare/v3.12.0...v3.13.0
[v3.12.0]: https://github.com/JeffreyCA/spleeter-web/compare/v3.11.0...v3.12.0
[v3.11.0]: https://github.com/JeffreyCA/spleeter-web/compare/v3.10.0...v3.11.0
[v3.10.0]: https://github.com/JeffreyCA/spleeter-web/compare/v3.9.0...v3.10.0
[v3.9.0]: https://github.com/JeffreyCA/spleeter-web/compare/v3.8.0...v3.9.0
[v3.8.0]: https://github.com/JeffreyCA/spleeter-web/compare/v3.7.0...v3.8.0
[v3.7.0]: https://github.com/JeffreyCA/spleeter-web/compare/v3.6.1...v3.7.0
[v3.6.1]: https://github.com/JeffreyCA/spleeter-web/compare/v3.6.0...v3.6.1
[v3.6.0]: https://github.com/JeffreyCA/spleeter-web/compare/v3.5.2...v3.6.0
[v3.5.2]: https://github.com/JeffreyCA/spleeter-web/compare/v3.5.1...v3.5.2
[v3.5.1]: https://github.com/JeffreyCA/spleeter-web/compare/v3.5.0...v3.5.1
[v3.5.0]: https://github.com/JeffreyCA/spleeter-web/compare/v3.4.0...v3.5.0
[v3.4.0]: https://github.com/JeffreyCA/spleeter-web/compare/v3.3.1...v3.4.0
[v3.3.1]: https://github.com/JeffreyCA/spleeter-web/compare/v3.3.0...v3.3.1
[v3.3.0]: https://github.com/JeffreyCA/spleeter-web/compare/v3.2.0...v3.3.0
[v3.2.0]: https://github.com/JeffreyCA/spleeter-web/compare/v3.1.1...v3.2.0
[v3.1.1]: https://github.com/JeffreyCA/spleeter-web/compare/v3.1.0...v3.1.1
[v3.1.0]: https://github.com/JeffreyCA/spleeter-web/compare/v3.0.0...v3.1.0
[v3.0.0]: https://github.com/JeffreyCA/spleeter-web/compare/v2.0.1...v3.0.0
[v2.0.1]: https://github.com/JeffreyCA/spleeter-web/compare/v2.0.0...v2.0.1
[v2.0.0]: https://github.com/JeffreyCA/spleeter-web/compare/v1.2.0...v2.0.0
[v1.2.0]: https://github.com/JeffreyCA/spleeter-web/compare/v1.1.0...v1.2.0
[v1.1.0]: https://github.com/JeffreyCA/spleeter-web/compare/v1.0.0...v1.1.0
[v1.0.0]: https://github.com/JeffreyCA/spleeter-web/compare/pre...v1.0.0
[Pre-release]: https://github.com/JeffreyCA/spleeter-web/releases/tag/pre
