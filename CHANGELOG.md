# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

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

[Unreleased]: https://github.com/JeffreyCA/spleeter-web/compare/v1.1.0...HEAD
[v1.1.0]: https://github.com/JeffreyCA/spleeter-web/compare/v1.0.0...v1.1.0
[v1.0.0]: https://github.com/JeffreyCA/spleeter-web/compare/pre...v1.0.0
[Pre-release]: https://github.com/JeffreyCA/spleeter-web/releases/tag/pre
