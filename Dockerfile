FROM alpine

# Installs latest Chromium (100) package.
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      npm \
      yarn \
      busybox-initscripts

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Puppeteer v13.5.0 works with Chromium 100.
RUN yarn add puppeteer@13.5.0

# Add user so we don't need --no-sandbox.
RUN addgroup -S pptruser && adduser -S -G pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads /app \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app

COPY . /home/node/app

WORKDIR /home/node/app

RUN cd /home/node/app && npm install

# Run everything after as non-privileged user.
#USER pptruser

#ENTRYPOINT [ "/usr/sbin/crond -f -l 0 -c /home/node/app/crontab" ]
ENTRYPOINT [ "/usr/sbin/crond", "-f", "-c", "/home/node/app/crontab" ]