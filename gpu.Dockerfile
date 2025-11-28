FROM nvidia/cuda:12.2.2-cudnn8-devel-ubuntu22.04

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

# Install all dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    software-properties-common \
    curl \
    ffmpeg \
    git \
    libasound2-dev \
    libmagic-dev \
    libopenmpi-dev \
    libsndfile-dev \
    openmpi-bin \
    rsync \
    ssh \
    wget \
    && add-apt-repository universe \
    && apt-get update

RUN add-apt-repository ppa:deadsnakes/ppa \
    && apt-get update \
    && apt-get -y install python3.11 python3.11-dev python3.11-distutils python3.11-venv python3.11-gdbm \
    && curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py \
    && python3.11 get-pip.py \
    && ln -sf /usr/bin/python3.11 /usr/bin/python3

# For yt-dlp: https://github.com/yt-dlp/yt-dlp/issues/15012
COPY --from=denoland/deno:bin-2.5.6 /deno /usr/local/bin/deno

RUN mkdir -p /webapp/media /webapp/staticfiles

WORKDIR /webapp

RUN pip3 install --upgrade pip
RUN pip3 install --upgrade wheel setuptools
RUN pip3 install torch==2.9.1 torchaudio==2.9.1 --index-url https://download.pytorch.org/whl/cu128

COPY requirements.txt requirements-spleeter.txt /webapp/
RUN pip3 install --upgrade pip -r requirements.txt
RUN pip3 install -r requirements-spleeter.txt --no-dependencies

# Hugging Face CLI
ENV HF_CLI_BIN_DIR=/usr/local/bin
RUN curl -LsSf https://hf.co/cli/install.sh | bash

COPY . .

COPY api-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/api-entrypoint.sh && ln -s /usr/local/bin/api-entrypoint.sh /

ENTRYPOINT ["api-entrypoint.sh"]
