FROM python:3.11-slim
# TODO so the xvfb is being weird now since there is no display in the docker container
# Test with fake code to get a screenshot
# It was just straight chrome not the driver :(
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libnss3 \
    libatk-bridge2.0-0 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libxshmfence1 \
    libglib2.0-0 \
    xvfb \
    xauth \
    unzip \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

RUN wget -qO /usr/share/keyrings/google-linux-signing-keyring.gpg https://dl.google.com/linux/linux_signing_key.pub \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-linux-signing-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" \
       > /etc/apt/sources.list.d/google-chrome.list
RUN apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 4999

COPY . .

CMD Xvfb :99 -screen 0 1920x1080x24 & python app.py