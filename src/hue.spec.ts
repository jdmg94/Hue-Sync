import HueBridge from "./hue"
import { getRegisteredCredentials } from "./utils"

import "../../XMLHTTPRequest.shim"

describe("hue", () => {
  it("should have a static discovery method", async () => {
    // const mockBridgeNetworkDevice = {
    //   id: "foo",
    //   internalipaddress: "bar",
    //   port: 123,
    // }

    const credentials = await getRegisteredCredentials()
    const [bridgeOnNetwork] = await HueBridge.discover()

    const bridge = new HueBridge({
      credentials,
      url: bridgeOnNetwork.internalipaddress,
    })

    // const config = await bridge.getConfig()
    // const lights = await bridge.getLights()
    // const scenes = await bridge.getScenes()
    // const entertainmentGroups = await bridge.getEntertainmentAreas()
    // const rooms = await bridge.getRooms()
    // const zones = await bridge.getZones()
    // const devices = await bridge.getDevices()
    // const homeAreas = await bridge.getHomeAreas()
    // const lightGroups = await bridge.getGroupedLights()
  
    // const home = await bridge.getHomeArea('4f942f16-c0ea-418a-b753-cda030262768')
    // const room = await bridge.getRoom('7d4d0fd2-60d0-4c86-a05e-6ba5e47be47e')
    // const scene = await bridge.getScene("aebbe7f5-eb79-4718-aca1-98c972230ffa")
    // const device = await bridge.getDevice("6c401483-b62b-46b2-b9bf-73ca9ce1095b")
    // const light = await bridge.getLight("6c401483-b62b-46b2-b9bf-73ca9ce1095b") // has gradient
    // const light = await bridge.getLight("782220b3-52ef-4ff7-b2eb-0d23d00d6c4c") // has effects
    // const lightGroup = await bridge.getLightGroup(
    //   "7832dd0f-24e6-4bcc-b166-61705d0bdcd7"
    // )
    // const area = await bridge.getEntertainmentArea(
    //   "ae59f511-f1e3-4d55-acdf-040650fc2e99"
    // )

    // console.log(lightGroup)
    // console.log(lightGroups)
    // console.log(homeAreas)
    // console.log(home)
    // console.log(rooms)
    // console.log(room)
    // console.log(config)
    // console.log(scenes)
    // console.log(scene)
    // console.log(entertainmentGroups)
    // console.log(area)
    // console.log(lights)
    // console.log(light)
    // console.log(zones)
    // console.log(devices)
    // console.log(device)
  })
})
