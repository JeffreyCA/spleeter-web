FROM nvidia/cuda:11.2.0-cudnn8-devel-ubuntu18.04

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install all dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
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
    && add-apt-repository universe && apt-get update && apt-get install -y \
    python3.7 \
    python3.7-gdbm \
    python3-distutils \
    && rm -rf /var/lib/apt/lists/*
RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py \
    && python3.7 get-pip.py \
    && ln -s /usr/local/cuda-11.2/targets/x86_64-linux/lib/libcudart.so.11.0 /usr/lib/x86_64-linux-gnu/libcudart.so.11.0

WORKDIR /webapp
RUN mkdir -p /webapp/{media,staticfiles}

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

COPY celery-slow-entrypoint.sh .
ENTRYPOINT ["./celery-slow-entrypoint.sh"]
