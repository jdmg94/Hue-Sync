import https from "https"
import fetch from "node-fetch"
import { dtls } from "node-dtls-client"

import sleep from "../../utils/sleep"
import {
  EntertainmentArea,
  Light,
  Scene,
  Room,
  Zone,
  Device,
  BridgeHome,
} from "./hue.types"
import {
  HueBridgeNetworkDevice,
  BridgeClientCredentials,
  BridgeConfig,
} from "../../types/Hue"

interface HueBridgeArgs {
  url: string
  credentials: BridgeClientCredentials
}
// V2 with Entertainment API
export default class HueBridge {
  static async discover(): Promise<HueBridgeNetworkDevice[]> {
    const response = await fetch("https://discovery.meethue.com/")

    return response.json()
  }
  
  static async getConfig(url: string): Promise<BridgeConfig> {
    const response = await fetch(`https://${url}/api/config`, { 
      agent: new https.Agent({ rejectUnauthorized: false }) 
    })

    return response.json()
  }

  static async register(
    url: string,
    devicetype: string = "hue-hdmi-sync"
  ): Promise<BridgeClientCredentials> {
    const endpoint = `http://${url}/api`
    const body = JSON.stringify({
      devicetype,
      generateclientkey: true,
    })

    const response = await fetch(endpoint, {
      body,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const [{ error, success }] = await response.json()

    if (error) throw error

    return success
  }

  // properties
  url: string = null
  socket: dtls.Socket = null
  entertainmentArea: EntertainmentArea = null
  credentials: BridgeClientCredentials = null
  httpAgent: https.Agent = new https.Agent({ rejectUnauthorized: false })

  constructor({ url, credentials }: HueBridgeArgs) {
    this.url = url
    this.credentials = credentials
  }

  async _request(endpoint, options: any = { headers: {}, method: "GET" }) {
    if (!options.headers) {
      options.headers = {}
    }
    
    if (options.body && options.method !== "GET") {
      options.headers["Content-Type"] = "application/json"
      options.body = JSON.stringify(options.body)
    }
    
    options.agent = this.httpAgent    
    options.headers["hue-application-key"] = this.credentials.username

    const response = await fetch(endpoint, options)

    return response.json()
  }

  _unwrap({ errors, data }) {
    if (!errors || errors.length === 0) {
      return data
    }

    throw errors[0]
  }

  // Datagram streaming
  async start(id: string): Promise<void> {
    const timeout = 500
    this.entertainmentArea = await this.getEntertainmentArea(id)

    await this.updateEntertainmentArea(this.entertainmentArea.id, {
      action: "start",
    })

    this.socket = dtls.createSocket({
      timeout,
      port: 2100,
      type: "udp4",
      address: this.url,
      cipherSuites: ["TLS_PSK_WITH_AES_128_GCM_SHA256"],
      psk: {
        [this.credentials.username]: Buffer.from(
          this.credentials.clientkey,
          "hex"
        ),
      },
    } as unknown as dtls.Options)

    await sleep(timeout)

    if (!this.socket) {
      throw new Error("Unable to start datagram socket!")
    }
  }

  async stop(): Promise<void> {    
    this.socket.close()
    await this.updateEntertainmentArea(this.entertainmentArea.id, {
      action: "stop",
    })
  }

  // #NOTE: one [R,G,B] per channel
  transition(colors: Array<[number, number, number]>) {
    const protocol = Buffer.from("HueStream")

    // V2.0
    const version = Buffer.from([
      0x02, // major revision
      0x00, // minor revision
    ])

    const sequenceNumber = Buffer.from([0x00])
    const reservedSpaces = Buffer.from([0x00, 0x00])
    const colorMode = Buffer.from([0x00]) // 0 = RGB, 1 = XY
    const reserved = Buffer.from([0x00])
    const groupId = Buffer.from(this.entertainmentArea.id)

    const rgbChannels = colors.map((rgb, channelIndex) => {
      return Buffer.from([
        channelIndex, // RGB Channel Id
        rgb[0], // R 16bit
        rgb[0], // R 16bit
        rgb[1], // G 16bit
        rgb[1], // G 16bit
        rgb[2], // B 16bit
        rgb[2], // B 16bit
      ])
    })

    const message = Buffer.concat([
      protocol,
      version,
      sequenceNumber, // currently ignored
      reservedSpaces,
      colorMode,
      reserved,
      groupId,
      ...rgbChannels,
    ])

    this.socket.send(message)
  }

  // Create
  addScene(data: Partial<Scene>) {}
  addRoom(data: Partial<Room>) {}
  addZone(data: Partial<Zone>) {}
  addBehaviorInstance(data: Partial<{}>) {}
  addGeoFenceClient(data: Partial<{}>) {}
  addEntertainmentArea(data: Partial<EntertainmentArea>) {}

  // Read
  async getLights(): Promise<Light[]> {
    const response = await this._request(
      `https://${this.url}/clip/v2/resource/light`
    )

    return this._unwrap(response)
  }

  async getLight(id: string): Promise<Light> {
    const response = await this._request(
      `https://${this.url}/clip/v2/resource/light/${id}`
    )

    return this._unwrap(response)[0]
  }

  async getGroupedLights() {
    const response = await this._request(
      `https://${this.url}/clip/v2/resource/grouped_light`
    )

    return this._unwrap(response)
  }

  async getLightGroup(id: string) {
    const response = await this._request(
      `https://${this.url}/clip/v2/resource/grouped_light/${id}`
    )

    return this._unwrap(response)[0]
  }

  async getScenes(): Promise<Scene[]> {
    const response = await this._request(
      `https://${this.url}/clip/v2/resource/scene`
    )

    return this._unwrap(response)
  }

  async getScene(id: string): Promise<Scene> {
    const response = await this._request(
      `https://${this.url}/clip/v2/resource/scene/${id}`
    )

    return this._unwrap(response)[0]
  }

  async getRooms(): Promise<Room[]> {
    const response = await this._request(
      `https://${this.url}/clip/v2/resource/room`
    )

    return this._unwrap(response)
  }

  async getRoom(id: string): Promise<Room> {
    const response = await this._request(
      `https://${this.url}/clip/v2/resource/room/${id}`
    )

    return this._unwrap(response)[0]
  }

  async getZones(): Promise<Zone[]> {
    const response = await this._request(
      `https://${this.url}/clip/v2/resource/zone`
    )

    return this._unwrap(response)
  }

  async getZone(id: string): Promise<Zone> {
    const response = await this._request(
      `https://${this.url}/clip/v2/resource/zone/${id}`
    )

    return this._unwrap(response)[0]
  }

  async getEntertainmentAreas(): Promise<EntertainmentArea[]> {
    const response = await this._request(
      `https://${this.url}/clip/v2/resource/entertainment_configuration`
    )

    return this._unwrap(response)
  }

  async getEntertainmentArea(id: string): Promise<EntertainmentArea> {
    const response = await this._request(
      `https://${this.url}/clip/v2/resource/entertainment_configuration/${id}`
    )

    return this._unwrap(response)[0]
  }

  async getHomeAreas(): Promise<BridgeHome[]> {
    const response = await this._request(
      `https://${this.url}/clip/v2/resource/bridge_home`
    )

    return this._unwrap(response)
  }

  async getHomeArea(id: string): Promise<BridgeHome> {
    const response = await this._request(
      `https://${this.url}/clip/v2/resource/bridge_home/${id}`
    )

    return this._unwrap(response)[0]
  }

  async getDevices(): Promise<Device[]> {
    const response = await this._request(
      `https://${this.url}/clip/v2/resource/device`
    )

    return this._unwrap(response)
  }

  async getDevice(id: string): Promise<Device> {
    const response = await this._request(
      `https://${this.url}/clip/v2/resource/device/${id}`
    )

    return this._unwrap(response)[0]
  }

  // not implemented yet
  getAllGeoFenceClients() {}
  getGeoFenceClient(id: string) {}

  getEntertainmentServices() {}
  getEntertainmentService(id: string) {}
  getMotionServices() {}
  getMotionService(id: string) {}
  getPowerDeviceServices() {}
  getPowerDeviceService(id: string) {}
  getTemperatureServices() {}
  getTemperatureService(id: string) {}
  getLightLevelServices() {}
  getLightLevelService(id: string) {}
  getButtonServices() {}
  getButtonService(id: string) {}
  getGeolocationServices() {}
  getGeolocationService(id: string) {}
  getHomeKitServices() {}
  getHomeKitService(id: string) {}
  getZigbeeConnectivityServices() {}
  getZigbeeConnectivityService(id: string) {}
  getZigbeeGreenPowerServices() {}
  getZigbeeGreenPowerService(id: string) {}

  getAllBehaviorScripts() {}
  getBehaviorScript(id: string) {}
  getAllBehaviorInstances() {}
  getBehaviorInstance(id: string) {}

  // Update
  async updateEntertainmentArea(id: string, updates: {}) {
    const response = await this._request(
      `https://${this.url}/clip/v2/resource/entertainment_configuration/${id}`,
      { method: "PUT", body: updates }
    )

    return this._unwrap(response)[0]
  }

  // not implemented yet
  updateLight(id: string, updates: {}) {}
  updateScene(id: string, updates: {}) {}
  updateRoom(id: string, updates: {}) {}
  updateZone(id: string, updates: {}) {}
  updateHomeArea(id: string, updates: {}) {}
  updateLightGroup(id: string, updates: {}) {}
  updateDevice(id: string, updates: {}) {}
  updateMotionService(id: string, updates: {}) {}
  updateTemperatureService(id: string, updates: {}) {}
  updateLightLevelService(id: string, updates: {}) {}
  updateButtonService(id: string, updates: {}) {}
  updateBehaviorInstance(id: string, updates: {}) {}
  updateGeoFenceClient(id: string, updates: {}) {}
  updateGeoLocationService(id: string, updates: {}) {}
  updateEntertainmentService(id: string, updates: {}) {}
  updateHomeKitService(id: string, updates: {}) {}
  updateDevicePowerService(id: string, updates: {}) {}
  updateZigbeeConnectivityService(id: string, update: {}) {}
  updateZigbeeGreenPowerService(id: string, updates: {}) {}

  // Delete
  removeScene(id: string): Promise<void> {
    return this._request(`https://${this.url}/clip/v2/resource/scene/${id}`, {
      method: "DELETE",
    })
  }
  removeRoom(id: string): Promise<void> {
    return this._request(`https://${this.url}/clip/v2/resource/room/${id}`, {
      method: "DELETE",
    })
  }
  removeZone(id: string): Promise<void> {
    return this._request(`https://${this.url}/clip/v2/resource/zone/${id}`, {
      method: "DELETE",
    })
  }
  removeBehaviorInstance(id: string): Promise<void> {
    return this._request(
      `https://${this.url}/clip/v2/resource/behavior_instance/${id}`,
      {
        method: "DELETE",
      }
    )
  }
  removeGeoFenceClient(id: string): Promise<void> {
    return this._request(
      `https://${this.url}/clip/v2/resource/geofence_client/${id}`,
      {
        method: "DELETE",
      }
    )
  }
  removeEntertainmentArea(id: string): Promise<void> {
    return this._request(
      `https://${this.url}/clip/v2/resource/entertainment_configuration/${id}`,
      {
        method: "DELETE",
      }
    )
  }
}
