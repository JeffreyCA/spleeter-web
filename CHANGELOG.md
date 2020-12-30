# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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


[Unreleased]: https://github.com/JeffreyCA/spleeter-web/compare/v2.0.1...HEAD
[v2.0.0]: https://github.com/JeffreyCA/spleeter-web/compare/v2.0.0...v2.0.1
[v2.0.0]: https://github.com/JeffreyCA/spleeter-web/compare/v1.2.0...v2.0.0
[v1.2.0]: https://github.com/JeffreyCA/spleeter-web/compare/v1.1.0...v1.2.0
[v1.1.0]: https://github.com/JeffreyCA/spleeter-web/compare/v1.0.0...v1.1.0
[v1.0.0]: https://github.com/JeffreyCA/spleeter-web/compare/pre...v1.0.0
[Pre-release]: https://github.com/JeffreyCA/spleeter-web/releases/tag/pre
