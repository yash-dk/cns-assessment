FROM python:3.10-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PYTHONUNBUFFERED=1
ENV RGL_USE_NULL=TRUE

# Recommended packages for R and Python
RUN apt-get update && apt-get install -y --no-install-recommends \
    libjpeg-dev zlib1g-dev libpng-dev libfreetype6-dev fontconfig \
    libgl1-mesa-dev libx11-dev curl gpg dirmngr ca-certificates \
    libxml2-dev libssl-dev libcurl4-openssl-dev pandoc libuuid1 uuid-dev \
    software-properties-common gnupg wget build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y --no-install-recommends r-base

RUN pip install --no-cache-dir \
    numpy pandas matplotlib seaborn plotly scikit-learn kaleido

RUN Rscript -e "install.packages(c( \
  'ggplot2', 'plotly', 'rgl', 'dplyr', 'data.table', 'htmlwidgets', 'uuid'), \
  repos='https://cloud.r-project.org/', dependencies=TRUE, verbose=TRUE)"

WORKDIR /app

# Entrypoint to run scripts in the container
CMD ["/bin/bash"]
