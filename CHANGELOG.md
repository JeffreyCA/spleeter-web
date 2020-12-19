# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2020-12-19
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

[1.0.0]: https://github.com/JeffreyCA/spleeter-web/compare/v1.0.0
[Pre-release]: https://github.com/JeffreyCA/spleeter-web/compare/pre
