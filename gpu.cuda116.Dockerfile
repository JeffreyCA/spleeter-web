FROM nvidia/cuda:11.6.1-cudnn8-devel-ubuntu20.04

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
    && apt-get update

RUN apt-get -y install python3.9 python3.9-gdbm python3-distutils \
    && curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py \
    && python3.9 get-pip.py \
    && ln -s /usr/local/cuda-11.6/targets/x86_64-linux/lib/libcudart.so.11.0 /usr/lib/x86_64-linux-gnu/libcudart.so.11.0

RUN mkdir -p /webapp/media /webapp/staticfiles

WORKDIR /webapp
RUN pip3 install torch==1.13.1+cu116 torchaudio==0.13.1+cu116 -f https://download.pytorch.org/whl/torch_stable.html

COPY requirements.txt requirements-spleeter.txt /webapp/
RUN pip3 install --upgrade pip -r requirements.txt
RUN pip3 install -r requirements-spleeter.txt --no-dependencies
COPY . .

COPY api-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/api-entrypoint.sh && ln -s /usr/local/bin/api-entrypoint.sh /

ENTRYPOINT ["api-entrypoint.sh"]
