FROM alpine:3.20

RUN apk add --no-cache curl

WORKDIR /app
COPY run-smoke.sh /app/run-smoke.sh
RUN chmod +x /app/run-smoke.sh

ENTRYPOINT ["/app/run-smoke.sh"]
