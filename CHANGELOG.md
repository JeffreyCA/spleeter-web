# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [v3.7.0] - 2021-06-21

### Added
- Support for D3Net model! Big thanks to Sony AI Research for making it [open-source](https://github.com/sony/ai-research-code/tree/master/d3net) ([paper](https://arxiv.org/abs/2010.01733)).

### Changed
- Fix GPU Docker image so that GPU-accelerated separation works properly with Spleeter


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


[Unreleased]: https://github.com/JeffreyCA/spleeter-web/compare/v3.7.0...HEAD
[v3.7.0]: https://github.com/JeffreyCA/spleeter-web/compare/v3.6.2...v3.7.0
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
