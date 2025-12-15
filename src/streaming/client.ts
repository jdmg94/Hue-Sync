/**
 * Entertainment API DTLS streaming client
 */

import { dtls } from "node-dtls-client";
import type { EntertainmentArea } from "./types";
import type { ResourceNode } from "../common/types";
import { HueBridgeStreamError } from "../errors";
import { ENTERTAINMENT_API } from "../constants";

/**
 * Streaming client for high-frequency Entertainment API updates
 */
export class StreamingClient {
  private socket: dtls.Socket | null = null;
  private abortController: AbortController | null = null;
  private entertainmentArea: EntertainmentArea | null = null;

  constructor(
    private readonly bridgeUrl: string,
    private readonly credentials: { username: string; clientkey: string },
    private readonly updateAreaFn: (
      id: string,
      updates: Partial<EntertainmentArea> & { action: string }
    ) => Promise<ResourceNode>
  ) {}

  /**
   * Check if streaming is currently active
   */
  get isStreaming(): boolean {
    return this.socket !== null;
  }

  /**
   * Starts Entertainment API streaming for high-frequency light updates.
   * Establishes a DTLS connection to the bridge for real-time color streaming.
   *
   * @param selectedArea - The entertainment area to stream to
   * @param timeout - Socket timeout in milliseconds (default: 1000)
   * @returns Promise that resolves when the connection is established
   *
   * @example
   * await streamingClient.start(entertainmentArea);
   * // Now you can call transition() to send color updates
   */
  async start(
    selectedArea: EntertainmentArea,
    timeout: number = ENTERTAINMENT_API.DEFAULT_TIMEOUT
  ): Promise<void> {
    this.entertainmentArea = selectedArea;
    this.abortController = new AbortController();

    await this.updateAreaFn(selectedArea.id, {
      action: "start",
    });

    this.socket = dtls.createSocket({
      timeout,
      port: ENTERTAINMENT_API.PORT,
      type: "udp4",
      address: this.bridgeUrl,
      signal: this.abortController.signal,
      cipherSuites: [ENTERTAINMENT_API.CIPHER_SUITE],
      psk: {
        [this.credentials.username]: Buffer.from(
          this.credentials.clientkey,
          "hex"
        ),
      },
    } as unknown as dtls.Options);

    return new Promise((resolve) => this.socket!.on("connected", resolve));
  }

  /**
   * Stops Entertainment API streaming and closes the DTLS connection.
   *
   * @throws {HueBridgeStreamError} If no streaming session is active
   *
   * @example
   * await streamingClient.stop();
   */
  stop(): void {
    if (!this.socket) {
      throw new HueBridgeStreamError("No active datagram socket!");
    }

    const id = this.entertainmentArea!.id;
    this.socket.on("close", () => {
      this.updateAreaFn(id, {
        action: "stop",
      });
    });

    this.abortController!.abort();
    this.entertainmentArea = null;
    this.abortController = null;
    this.socket = null;
  }

  /**
   * Sends color updates to the entertainment area via DTLS streaming.
   * Each array element represents one channel/zone with RGB values (0-255).
   *
   * @param colors - Array of [R, G, B] arrays, one per zone/channel
   * @throws {HueBridgeStreamError} If no streaming session is active
   *
   * @example
   * // For a gradient strip with 7 zones, send 7 colors:
   * streamingClient.transition([
   *   [255, 0, 0],    // Zone 0: Red
   *   [0, 255, 0],    // Zone 1: Green
   *   [0, 0, 255],    // Zone 2: Blue
   *   // ... 4 more zones
   * ]);
   */
  transition(colors: number[][]): void {
    if (!this.socket) {
      throw new HueBridgeStreamError("No active datagram socket!");
    }

    const protocol = Buffer.from(ENTERTAINMENT_API.PROTOCOL_NAME);
    const version = Buffer.from(ENTERTAINMENT_API.PROTOCOL_VERSION);
    const sequenceNumber = Buffer.from([ENTERTAINMENT_API.SEQUENCE_NUMBER]);
    const reservedSpaces = Buffer.from([
      ENTERTAINMENT_API.RESERVED_SPACE,
      ENTERTAINMENT_API.RESERVED_SPACE,
    ]);
    const colorMode = Buffer.from([ENTERTAINMENT_API.COLOR_MODE.RGB]);
    const reservedSpace = Buffer.from([ENTERTAINMENT_API.RESERVED_SPACE]);
    const groupId = Buffer.from(this.entertainmentArea!.id);
    const rgbChannels = colors.map((rgb, channelIndex) => {
      return Buffer.from([
        channelIndex, // RGB Channel Id
        rgb[0], // R 16bit
        rgb[0], // R 16bit
        rgb[1], // G 16bit
        rgb[1], // G 16bit
        rgb[2], // B 16bit
        rgb[2], // B 16bit
      ]);
    });

    const message = Buffer.concat([
      protocol,
      version,
      sequenceNumber,
      reservedSpaces,
      colorMode,
      reservedSpace,
      groupId,
      ...rgbChannels,
    ]);

    this.socket.send(message);
  }
}
