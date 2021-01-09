FROM nvidia/cuda:10.2-cudnn7-devel-ubuntu18.04

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

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
    && apt-get -y install python3.7 python3.7-gdbm python3-distutils \
    && curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py \
    && python3.7 get-pip.py

RUN mkdir -p /webapp/media /webapp/staticfiles

WORKDIR /webapp
COPY requirements.txt /webapp/
RUN pip3 install --upgrade pip -r requirements.txt

COPY . .

COPY api-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/api-entrypoint.sh && ln -s /usr/local/bin/api-entrypoint.sh /

ENTRYPOINT ["api-entrypoint.sh"]
