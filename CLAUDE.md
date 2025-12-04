# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hue-Sync is a TypeScript library for the Philips Hue CLIP API v2, providing HTTPS-based communication with Philips Hue bridges. Key features include mDNS discovery, Entertainment API (DTLS streaming), and support for gradient lightstrip zones.

## Build and Development Commands

### Testing
```bash
npm test                    # Run all tests in src/ using Vitest
npm run test:watch          # Run tests in watch mode
npm run test:ui             # Run tests with Vitest UI
npm run test:coverage       # Run tests with coverage report
```

### Code Quality
```bash
npm run lint                # Format code with Prettier
```

### Building
```bash
npm run build               # Build library using Vite (transpile + generate .d.ts files)
```

### Publishing
```bash
npm run publish             # Build and publish to npm
```

## Architecture

### Core Structure

The library consists of a single main class (`HueBridge`) in `src/hue.ts` with comprehensive type definitions in `src/hue.types.ts`. The entry point `src/index.ts` re-exports everything.

### Key Components

**HueBridge Class** (`src/hue.ts`)
- **Static Methods**:
  - `discover()`: Finds bridges on local network using mDNS (node-dns-sd), falls back to Philips discovery API
  - `register(url, devicetype)`: Registers application with bridge to obtain credentials

- **Instance Methods** organized by resource type:
  - `get*()`: Retrieve resources (lights, scenes, rooms, zones, entertainment areas, devices, etc.)
  - `update*()`: Modify resources (lights, scenes, rooms, entertainment areas, etc.)
  - Entertainment API: `start()`, `stop()`, `transition()`

**Type System** (`src/hue.types.ts`)
- Comprehensive TypeScript definitions for all Hue API v2 resources
- Resource types include: Light, Scene, Room, Zone, EntertainmentArea, Device, BehaviorInstance, GeoFenceClient
- Base interfaces: ResourceNode, HueBridgeArgs, BridgeClientCredentials

### DNS Patching for HTTPS

The library patches Node's DNS lookup (`src/hue.ts:23-36`) to resolve bridge IDs to local IP addresses, enabling HTTPS with proper certificate validation. This is critical for secure communication.

The DNS patch applies when the HueBridge constructor is called and returns addresses in the Node.js 22+ format: `[{ family: 4, address: ip }]`.

### Entertainment API (DTLS Streaming)

For high-frequency light updates (e.g., Ambilight sync), use the Entertainment API:

1. Get entertainment area: `getEntertainmentAreas()`
2. Start streaming: `start(selectedArea)` - establishes DTLS connection on port 2100
3. Send color updates: `transition(colors)` - array of `[R,G,B]` per zone (7 zones for gradient strips)
4. Stop streaming: `stop()` - closes DTLS socket and disables streaming mode

The Entertainment API uses `node-dtls-client` with PSK cipher suite `TLS_PSK_WITH_AES_128_GCM_SHA256`.

## Build Tooling

**Build System**: Uses Vite for modern, fast builds
- Config: `vite.config.ts` - library mode with CommonJS output
- Target: ES2020, minified
- External dependencies: `node-dns-sd`, `node-dtls-client` (not bundled)
- Output: `build/` directory with `index.js` and `index.d.ts`

**Type Declarations**: Generated via `vite-plugin-dts`
- Config: `vite.config.ts` - automatically generates `.d.ts` files during build
- Excludes test files (*.spec.ts)
- Rolls up all type declarations into single `index.d.ts`

**Testing**: Vitest with native TypeScript support
- Config: `vitest.config.ts` - Node environment with global test APIs
- Mocking: Uses Vitest's `vi.mock()` for mocking `node-dns-sd` and `node-dtls-client`
- Fetch mocking: Custom helper function using Vitest's mock utilities
- All test files: `src/**/*.spec.ts`

## HTTPS Certificate Handling

The repository includes `signify.pem` (Signify CA certificate for Hue Bridges). To use HTTPS:

**Required**: Set `NODE_EXTRA_CA_CERTS=signify.pem` environment variable

**Development Only**: Use `NODE_TLS_REJECT_UNAUTHORIZED=0` (not recommended for production)

## Requirements

**Node.js**: Version 22 or later (uses native fetch API)

## Dependencies

**Core Runtime**:
- `node-dns-sd`: mDNS discovery for finding bridges on local network
- `node-dtls-client`: DTLS sockets for Entertainment API streaming

## Important Implementation Notes

- The library uses native fetch API (available in Node.js 22+)
- All API requests include `hue-application-key` header with username credential
- Responses follow `JSONResponse<T>` pattern with `data` and optional `errors` array
- The `_unwrap()` method extracts data or throws the first error
- Entertainment streaming uses UDP datagrams, not HTTP
