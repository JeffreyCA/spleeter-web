# Spleeter Web
[![Latest release](https://img.shields.io/github/v/release/JeffreyCA/spleeter-web?label=latest%20release)](https://github.com/JeffreyCA/spleeter-web/releases) [![Commits since latest release](https://img.shields.io/github/commits-since/JeffreyCA/spleeter-web/latest/master?color=yellow)](https://github.com/JeffreyCA/spleeter-web/commits/master) [![Docker Compose push](https://github.com/JeffreyCA/spleeter-web/workflows/Docker%20Compose%20push/badge.svg)](https://github.com/JeffreyCA/spleeter-web/actions?query=workflow%3A%22Docker+Compose+push%22)

Spleeter Web is a web application for isolating or removing the vocal, accompaniment, bass, and/or drum components of any song. For example, you can use it to isolate the vocals of a track, or you can use it remove the vocals to get an instrumental version of a song.

It supports a number of different source separation models: [Spleeter](https://github.com/deezer/spleeter) (`4stems-model`), [Demucs](https://github.com/facebookresearch/demucs), [CrossNet-Open-Unmix](https://github.com/sony/ai-research-code/tree/master/x-umx), and [D3Net](https://github.com/sony/ai-research-code/tree/master/d3net).

The app uses [Django](https://www.djangoproject.com/) for the backend API and [React](https://reactjs.org/) for the frontend. [Celery](https://docs.celeryproject.org/en/stable/getting-started/introduction.html) is used for the task queue. Docker images are available, including ones with GPU support.

## Table of Contents

- [Features](#features)
- [Demo site](#demo-site)
- [Getting started with Docker](#getting-started-with-docker)
- [Getting started without Docker](#getting-started-without-docker)
- [Configuration](#configuration)
    - [Django settings](#django-settings)
    - [Environment variables](#environment-variables)
- [Using cloud storage](#using-cloud-storage-azure-storage-aws-s3-etc)
- [Deployment](#deployment)
- [Common issues & FAQs](#common-issues--faqs)
- [Credits](#credits)
- [License](#license)

## Features
- Supports Spleeter, Demucs, CrossNet-Open-Unmix (X-UMX), and D3Net source separation models
    - Each model supports a different set of user-configurable parameters in the UI
- Dynamic Mixes let you export and play back in realtime your own custom mix of the different components
- Import tracks by uploading a file (MP3, FLAC, WAV) or by YouTube link
    - Built-in YouTube search functionality (YouTube Data API key required)
- Persistent audio library with ability to stream and download your source tracks and mixes
- Customize number of background workers working on audio separation and YouTube imports
- Supports third-party storage backends like S3 and Azure Blob Storage
- Clean and responsive UI
- Support for GPU separation
- Fully Dockerized

## [Demo site](https://jeffreyca.github.io/spleeter-web/)

**Homepage**

<img src="./screenshots/main.png" width="80%">

**Upload modal**

<img src="./screenshots/upload.png" width="45%">

**Mixer**

<img src="./screenshots/mixer.png" width="80%">

## Getting started with Docker
### Requirements
* 4 GB+ of memory (source separation is memory-intensive)
* [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/install/)

### Instructions
1. Clone repo:
    ```sh
    $ git clone https://github.com/JeffreyCA/spleeter-web.git
    $ cd spleeter-web
    ```
2. (Optional) Set the YouTube Data API key (for YouTube search functionality):

    You can skip this step, but you would not be able to import songs by searching with a query. You would still be able to import songs via YouTube links though.

    Create an `.env` file at the project root with the following contents:
    ```
    YOUTUBE_API_KEY=<YouTube Data API key>
    ```
3. (Optional) Setup for GPU support:
    Source separation can be accelerated with a GPU (however only NVIDIA GPUs are supported).

    1. Install NVIDIA drivers for your GPU.

    2. [Install the NVIDIA Container Toolkit.](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html#docker) If on Windows, refer to [this](https://docs.nvidia.com/cuda/wsl-user-guide/index.html).

    3. Verify Docker works with your GPU by running `sudo docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi`

4. Download and run prebuilt Docker images:
    ```sh
    # CPU separation
    spleeter-web$ docker-compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.prod.selfhost.yml up
    # GPU separation
    spleeter-web$ docker-compose -f docker-compose.gpu.yml -f docker-compose.prod.yml -f docker-compose.prod.selfhost.yml up
    ```

    Alternatively, you can build the Docker images from source:
    ```sh
    # CPU separation
    spleeter-web$ docker-compose -f docker-compose.yml -f docker-compose.build.yml -f docker-compose.prod.yml -f docker-compose.prod.selfhost.yml up --build
    # GPU separation
    spleeter-web$ docker-compose -f docker-compose.gpu.yml -f docker-compose.build.gpu.yml -f docker-compose.prod.yml -f docker-compose.prod.selfhost.yml up --build
    ```

5. Launch **Spleeter Web**

    Navigate to [http://127.0.0.1:80](http://127.0.0.1:80) in your browser. Uploaded tracks and generated mixes will appear in `media/uploads` and `media/separate` respectively on your host machine.

## Getting started without Docker
**If you are on Windows, it's recommended to follow the Docker instructions above. Celery is not well-supported on Windows.**

### Requirements
* 4 GB+ of memory (source separation is memory-intensive)
* Python 3.8+ ([link](https://www.python.org/downloads/))
* Node.js 16+ ([link](https://nodejs.org/en/download/))
* Redis ([link](https://redis.io/))
* ffmpeg and ffprobe ([link](https://www.ffmpeg.org/download.html))
    * On macOS, you can install it using Homebrew or MacPorts
    * On Windows, you can follow [this guide](http://blog.gregzaal.com/how-to-install-ffmpeg-on-windows/)

### Instructions
1. Set environment variables

    **Make sure these variables are set in every terminal session prior to running the commands below.**

    ```sh
    # Unix/macOS:
    (env) spleeter-web$ export YOUTUBE_API_KEY=<api key>
    # Windows:
    (env) spleeter-web$ set YOUTUBE_API_KEY=<api key>
    ```
2. Create Python virtual environment
    ```sh
    spleeter-web$ python -m venv env
    # Unix/macOS:
    spleeter-web$ source env/bin/activate
    # Windows:
    spleeter-web$ .\env\Scripts\activate
    ```
3. Install Python dependencies
    ```sh
    (env) spleeter-web$ pip install -r requirements.txt
    ```
4. Install Node dependencies
    ```sh
    spleeter-web$ cd frontend
    spleeter-web/frontend$ npm install
    ```
5. Ensure Redis server is running on `localhost:6379` (needed for Celery)

    You can run it on a different host or port, but make sure to update `CELERY_BROKER_URL` and `CELERY_RESULT_BACKEND` in `settings.py`. It must be follow the format: `redis://host:port/db`.

6. Apply migrations
    ```sh
    (env) spleeter-web$ python manage.py migrate
    ````
7. Build frontend
    ```sh
    spleeter-web$ npm run build --prefix frontend
    ```
8. Start backend in separate terminal
    ```sh
    (env) spleeter-web$ python manage.py collectstatic && python manage.py runserver 127.0.0.1:8000
    ````

9. Start Celery workers in separate terminal

    **Unix/macOS:**
    ```sh
    # Start fast worker
    (env) spleeter-web$ celery -A api worker -l INFO -Q fast_queue -c 3

    # Start slow worker
    (env) spleeter-web$ celery -A api worker -l INFO -Q slow_queue -c 1
    ```

    This launches two Celery workers: one processes fast tasks like YouTube imports and the other processes slow tasks like source separation. The one working on fast tasks can work on 3 tasks concurrently, while the one working on slow tasks only handles a single task at a time (since it's memory-intensive). Feel free to adjust these values to your fitting.

    **Windows:**

    You'll first need to install `gevent`. Note however that you will not be able to abort in-progress tasks if using Celery on Windows.

    ```sh
    (env) spleeter-web$ pip install gevent
    ```

    ```sh
    # Start fast worker
    (env) spleeter-web$ celery -A api worker -l INFO -Q fast_queue -c 3 --pool=gevent

    # Start slow worker
    (env) spleeter-web$ celery -A api worker -l INFO -Q slow_queue -c 1 --pool=gevent
    ```

10. Launch **Spleeter Web**

    Navigate to [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser. Uploaded and mixed tracks will appear in `media/uploads` and `media/separate` respectively.

## Configuration

### Django settings

| Settings file | Description |
|---|---|
| `django_react/settings.py` | The base Django settings used when launched in non-Docker context. |
| `django_react/settings_dev.py` | Contains the **override** settings used when run in development mode (i.e. `DJANGO_DEVELOPMENT` is set). |
| `django_react/settings_docker.py` | The base Django settings used when launched using Docker. |
| `django_react/settings_docker_dev.py` | Contains the **override** settings used when run in development mode using Docker (i.e. `docker-compose.dev.yml`). |

### Environment variables
Here is a list of all the environment variables you can use to further customize Spleeter Web:

| Name | Description |
|---|---|
| `CPU_SEPARATION` | No need to set this if using Docker. Otherwise, set to `1` if you want CPU separation and `0` if you want GPU separation. |
| `DJANGO_DEVELOPMENT` | Set to `true` if you want to run development build, which uses `settings_dev.py`/`settings_docker_dev.py` and runs Webpack in dev mode. |
| `ALLOW_ALL_HOSTS` | Set to `1` if you want Django to allow all hosts, overriding any `APP_HOST` value. This effectively sets the Django setting `ALLOWED_HOSTS` to `[*]`. There are [security risks](https://docs.djangoproject.com/en/4.1/ref/settings/#allowed-hosts) associated with doing this. Default: `0` |
| `APP_HOST` | Domain name(s) or public IP(s) of server. To specify multiple hosts, separate them by a comma (`,`). |
| `API_HOST` | Hostname of API server (for nginx). |
| `DEFAULT_FILE_STORAGE` | Whether to use local filesystem or cloud-based storage for storing uploads and separated files. `FILE` or `AWS` or `AZURE`. |
| `AWS_ACCESS_KEY_ID` | AWS access key. Used when `DEFAULT_FILE_STORAGE` is set to `AWS`. |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key. Used when `DEFAULT_FILE_STORAGE` is set to `AWS`. |
| `AWS_STORAGE_BUCKET_NAME` | AWS S3 storage bucket name. Used when `DEFAULT_FILE_STORAGE` is set to `AWS`. |
| `AWS_S3_CUSTOM_DOMAIN` | Custom domain, such as for a CDN. Used when `DEFAULT_FILE_STORAGE` is set to `AWS`. |
| `AZURE_ACCOUNT_KEY` | Azure Blob account key. Used when `DEFAULT_FILE_STORAGE` is set to `AZURE`. |
| `AZURE_ACCOUNT_NAME` | Azure Blob account name. Used when `DEFAULT_FILE_STORAGE` is set to `AZURE`. |
| `AZURE_CONTAINER` | Azure Blob container name. Used when `DEFAULT_FILE_STORAGE` is set to `AZURE`. |
| `AZURE_CUSTOM_DOMAIN` | Custom domain, such as for a CDN. Used when `DEFAULT_FILE_STORAGE` is set to `AZURE`. |
| `CELERY_BROKER_URL` | Broker URL for Celery (e.g. `redis://localhost:6379/0`). |
| `CELERY_RESULT_BACKEND` | Result backend for Celery (e.g. `redis://localhost:6379/0`). |
| `CELERY_FAST_QUEUE_CONCURRENCY` | Number of concurrent YouTube import tasks Celery can process. Docker only. |
| `CELERY_SLOW_QUEUE_CONCURRENCY` | Number of concurrent source separation tasks Celery can process. Docker only. |
| `CERTBOT_DOMAIN` | Domain for creating HTTPS certs using Let's Encrypt's Certbot. Docker only. |
| `CERTBOT_EMAIL` | Email address for creating HTTPS certs using Let's Encrypt's Certbot. Docker only. |
| `D3NET_OPENVINO` | Set to `1` to use OpenVINO for D3Net CPU separation. Requires Intel CPU. |
| `DEMUCS_SEGMENT_SIZE` | Length of each split for GPU separation. Default is `40`, which requires a around 7 GB of GPU memory. For GPUs with 2-4 GB of memory, experiment with lower values (minimum is `10`). Also recommended to set `PYTORCH_NO_CUDA_MEMORY_CACHING=1`. |
| `D3NET_OPENVINO_THREADS` | Set to the number of CPU threads for D3Net OpenVINO separation. Default: # of CPUs on the machine. Requires Intel CPU. |
| `DEV_WEBSERVER_PORT` | Port that development webserver is mapped to on **host** machine. Docker only. |
| `ENABLE_CROSS_ORIGIN_HEADERS` | Set to `1` to set `Cross-Origin-Embedder-Policy` and `Cross-Origin-Opener-Policy` headers which are required for exporting Dynamic Mixes in-browser. |
| `NGINX_PORT` | Port that Nginx is mapped to on **host** machine for HTTP. Docker only. |
| `NGINX_PORT_SSL` | Port that Nginx is mapped to on **host** machine for HTTPS. Docker only. |
| `PYTORCH_NO_CUDA_MEMORY_CACHING` | Set to `1` to disable Pytorch caching for GPU separation. May help with Demucs separation on lower memory GPUs. Also see `DEMUCS_SEGMENT_SIZE`. |
| `UPLOAD_FILE_SIZE_LIMIT` | Maximum allowed upload file size (in megabytes). Default is `100`. |
| `YOUTUBE_API_KEY` | YouTube Data API key. |
| `YOUTUBE_LENGTH_LIMIT` | Maximum allowed YouTube track length (in minutes). Default is `30`. |

## Using cloud storage (Azure Storage, AWS S3, etc.)

By default, **Spleeter Web** uses the local filesystem to store uploaded files and mixes. It uses [django-storages](https://django-storages.readthedocs.io/en/latest/), so you can also configure it to use other storage backends like Azure Storage or AWS S3.

You can set the environment variable `DEFAULT_FILE_STORAGE` (`.env` if using Docker) to either `FILE` (for local storage), `AWS` (S3 storage), or `AZURE` (Azure Storage).

Then, depending on which backend you're using, set these additional variables:

**AWS S3:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_STORAGE_BUCKET_NAME`

**Azure Storage:**
- `AZURE_ACCOUNT_KEY`
- `AZURE_ACCOUNT_NAME`
- `AZURE_CONTAINER`

### CORS

To play back a dynamic mix, you may need to configure your storage service's CORS settings to allow the `Access-Control-Allow-Origin` header.

If you have `ENABLE_CROSS_ORIGIN_HEADERS` set, then you'll need to additionally set the `Cross-Origin-Resource-Policy` response headers of audio files to `cross-origin`. See [this](https://web.dev/coop-coep/) for more details.

## Deployment
**Spleeter Web** can be deployed on a VPS or a cloud server such as Azure VMs, AWS EC2, DigitalOcean, etc. Deploying to cloud container services like ECS is not yet supported out of the box.

1. Clone this git repo
    ```sh
    $ git clone https://github.com/JeffreyCA/spleeter-web.git
    $ cd spleeter-web
    ```

2. (Optional) If self-hosting, update `docker-compose.prod.selfhost.yml` and replace `./media` with the path where media files should be stored on the server.

3. In `spleeter-web`, create an `.env` file with the production environment variables

    Example `.env` file:
    ```
    APP_HOST=<domain name(s) or public IP(s) of server>
    DEFAULT_FILE_STORAGE=<FILE or AWS or AZURE>       # Optional (default = FILE)
    CELERY_FAST_QUEUE_CONCURRENCY=<concurrency count> # Optional (default = 3)
    CELERY_SLOW_QUEUE_CONCURRENCY=<concurrency count> # Optional (default = 1)
    YOUTUBE_API_KEY=<youtube api key>                 # Optional
    ```

    See [Environment Variables](#environment-variables) for all the available variables. You can also set these directly in the `docker-compose.*.yml` files.

4. Build and start production containers

    **For GPU separation, replace `docker-compose.yml` and `docker-compose.build.yml` below for `docker-compose.gpu.yml` and `docker-compose.build.gpu.yml` respectively.**

    If you are self-hosting media files:
    ```sh
    # Use prebuilt images
    spleeter-web$ sudo docker-compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.prod.selfhost.yml up -d
    # Or build from source
    spleeter-web$ sudo docker-compose -f docker-compose.yml -f docker-compose.build.yml -f docker-compose.prod.yml -f docker-compose.prod.selfhost.yml up --build -d
    ```

    Otherwise if using a storage provider:
    ```sh
    # Use prebuilt images
    spleeter-web$ sudo docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    # Or build from source
    spleeter-web$ sudo docker-compose -f docker-compose.yml -f docker-compose.build.yml -f docker-compose.prod.yml up --build -d
    ```

4. Access **Spleeter Web** at whatever you set `APP_HOST` to. Note that it will be running on port 80, not 8000. You can change this by setting `NGINX_PORT` and `NGINX_PORT_SSL`.

## HTTPS support

Enabling HTTPS allows you to export Dynamic Mixes from your browser. To enable HTTPS, set **both** `CERTBOT_DOMAIN` and `CERTBOT_EMAIL` to your domain name and `CERTBOT_EMAIL` to your email in `.env` and include `-f docker-compose.https.yml` in your `docker-compose up` command.

## [Common issues & FAQs](https://github.com/JeffreyCA/spleeter-web/wiki/Common-issues-&-FAQs)

## Credits
Special thanks to my [Sponsors](https://github.com/sponsors/JeffreyCA/):

* [603000](https://github.com/603000)

And especially to all the researchers and devs behind all the source separation models:

* [Spleeter](https://github.com/deezer/spleeter)
* [Demucs](https://github.com/facebookresearch/demucs)
* [CrossNet-Open-Unmix](https://github.com/sony/ai-research-code/tree/master/x-umx)
* [D3Net](https://github.com/sony/ai-research-code/tree/master/d3net)

And additional thanks to these wonderful projects:

* [tone.js](https://github.com/Tonejs/Tone.js/)
* [youtube-dl](https://github.com/ytdl-org/youtube-dl) / [yt-dlp](https://github.com/yt-dlp/yt-dlp)
* [react-dropzone-uploader](https://github.com/fortana-co/react-dropzone-uploader)
* [react-music-player](https://github.com/lijinke666/react-music-player)
* [docker-nginx-certbot](https://github.com/JonasAlfredsson/docker-nginx-certbot)

Turntable icon made from [Icon Fonts](https://www.onlinewebfonts.com/icon/497039) is licensed by CC BY 3.0.

## License
[MIT](./LICENSE)
