FROM dart:stable AS build
WORKDIR /app

COPY pubspec.yaml pubspec.lock ./
RUN dart pub get

COPY bin ./bin
COPY lib ./lib
RUN dart compile exe bin/barramento_service_dart.dart -o /app/servidor

FROM debian:stable-slim

# curl só para o healthcheck do compose.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/servidor /app/servidor

USER nobody
EXPOSE 10000

CMD ["/app/servidor"]
