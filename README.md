# synergy
## this is a chat app i made as a sort of portfolio piece
## it uses
- ollama
- nextjs
- tailwind
- react
- docker
- hmac sha256 hashing
## it's mostly just a little something to prove i'm not stupid :3

## quickstart (docker compose)
```yaml
services:
  synergy:
    image: ghcr.io/madelynnsadie/synergy:latest
    network_mode: host
    volumes:
      - ./data:/synergydata
    environment:
      - SYNERGY_DATA=/synergydata/data.json
      - SYNERGY_PRIVATE_KEY=awesomekey
```
**DO NOT** expose your service without a cryptographically secure private key

## disclaimer
there's no handholding in setup here, the only real use case here is a base for power users to make their own UI for something bigger. if you want to get it up and running, expect to be required to manually prepare db files, create hashed passwords for the admin account, tweak the docker compose file, etc.
anyway, have fun ^-^