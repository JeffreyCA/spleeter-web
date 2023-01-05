FROM nvidia/cuda:11.4.3-cudnn8-devel-ubuntu20.04

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
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
    && apt-get update \
    && apt-get -y install python3.8 python3.8-gdbm python3-distutils \
    && curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py \
    && python3.8 get-pip.py \
    && ln -s /usr/local/cuda-11.4/targets/x86_64-linux/lib/libcudart.so.11.0 /usr/lib/x86_64-linux-gnu/libcudart.so.11.0

RUN mkdir -p /webapp/media /webapp/staticfiles

WORKDIR /webapp
COPY requirements.txt /webapp/
RUN pip3 install torch==1.13.1 torchaudio==0.13.1 --extra-index-url https://download.pytorch.org/whl/cu116
RUN pip3 install --upgrade pip -r requirements.txt

COPY . .

COPY api-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/api-entrypoint.sh && ln -s /usr/local/bin/api-entrypoint.sh /

ENTRYPOINT ["api-entrypoint.sh"]
