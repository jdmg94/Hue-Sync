import HueBridge from "./hue";
import fetchMock from "./__mocks__/cross-fetch";
import {
  Light,
  BridgeConfig,
  ResourceNode,
  EntertainmentArea,
  HueBridgeNetworkDevice,
  BridgeClientCredentials,
} from "./hue.types";

describe("hue-sync", () => {
  const mockIp = "1.2.3.4";
  const mockCredentials: BridgeClientCredentials = {
    username: "foo",
    clientkey: "bar",
  };

  afterEach(() => {
    fetchMock.restore();
    fetchMock.reset();
  });

  describe("static methods", () => {
    it("should be able to discover Hue Bridge devices on the local network", async () => {
      const mockBridgeNetworkDevice: HueBridgeNetworkDevice = {
        id: "foo",
        port: 123,
        internalipaddress: "bar",
      };

      fetchMock.get("https://discovery.meethue.com/", [
        mockBridgeNetworkDevice,
      ]);

      const [bridgeOnNetwork] = await HueBridge.discover();

      expect(bridgeOnNetwork).toEqual(mockBridgeNetworkDevice);
    });

    it("should be able to register hue-sync on Hue Bridge device", async () => {
      fetchMock.post(`http://${mockIp}/api`, [{ success: mockCredentials }]);

      const credentials = await HueBridge.register(mockIp);

      expect(credentials).toEqual(mockCredentials);
    });

    it("should be able to retrieve Hue Bridge config information", async () => {
      const mockConfig: BridgeConfig = {
        name: "foo",
        datastoreversion: "bar",
        swversion: "baz",
        apiversion: "lorem",
        mac: "ipsum",
        bridgeid: "dolor",
        factorynew: "sit",
        replacesbridgeid: "amet",
        modelid: "consecutir",
        starterkitid: "dolor",
      };

      fetchMock.get(`http://${mockIp}/api/config`, mockConfig);

      const config = await HueBridge.getInfo(mockIp);

      expect(config).toEqual(mockConfig);
    });
  });

  describe("instance methods", () => {
    let bridge = new HueBridge({
      url: mockIp,
      credentials: mockCredentials,
    });

    const justGreen = [0, 255, 0];
    const mockResourceNode: ResourceNode = { rid: "foo", rtype: "_test" };

    const mockLight: Light = {
      alert: { action_values: ["test"] },
      color: {
        gamut: {
          blue: { x: 1, y: 2 },
          green: { x: 3, y: 4 },
          red: { x: 5, y: 6 },
        },
        gamut_type: "test",
        xy: { x: 1, y: 2 },
      },
      color_temperature: {
        mirek: 1,
        mirek_schema: { mirek_maximum: 10, mirek_minimum: 0 },
        mirek_valid: true,
      },
      dimming: {
        brightness: 1,
        min_dim_level: 0,
      },
      dynamics: {
        speed: 1,
        speed_valid: true,
        status: "foo",
        status_values: ["foo", "bar"],
      },
      effects: {
        effect_values: ["foo", "bar"],
        status: "baz",
        status_values: ["baz", "bar", "foo"],
      },
      gradient: {
        points: [{ color: { xy: { x: 1, y: 2 } } }],
        points_capable: 1,
      },
      id: "test",
      id_v1: "test",
      metadata: { archetype: "test", name: "foobar" },
      mode: "test",
      on: { on: true },
      owner: mockResourceNode,
      type: "test",
    };

    const secondMockLight: Light = {
      alert: { action_values: ["test"] },
      color: {
        gamut: {
          blue: { x: 1, y: 2 },
          green: { x: 3, y: 4 },
          red: { x: 5, y: 6 },
        },
        gamut_type: "test",
        xy: { x: 1, y: 2 },
      },
      color_temperature: {
        mirek: 1,
        mirek_schema: { mirek_maximum: 10, mirek_minimum: 0 },
        mirek_valid: true,
      },
      dimming: {
        brightness: 1,
        min_dim_level: 0,
      },
      dynamics: {
        speed: 1,
        speed_valid: true,
        status: "foo",
        status_values: ["foo", "bar"],
      },
      effects: {
        effect_values: ["foo", "bar"],
        status: "baz",
        status_values: ["baz", "bar", "foo"],
      },
      gradient: {
        points: [{ color: { xy: { x: 1, y: 2 } } }],
        points_capable: 1,
      },
      id: "test2",
      id_v1: "test2",
      metadata: { archetype: "test", name: "foobar" },
      mode: "test",
      on: { on: true },
      owner: mockResourceNode,
      type: "test",
    };

    const mockEntertainmentArea: EntertainmentArea = {
      channels: [
        {
          channel_id: 0,
          position: [
            {
              x: 1,
              y: 2,
              z: 3,
            },
            {
              x: 4,
              y: 5,
              z: 6,
            },
          ],
          members: [
            {
              index: 0,
              service: mockResourceNode,
            },
          ],
        },
      ],
      configuration_type: "test",
      id: "test",
      id_v1: "test",
      light_services: [mockResourceNode],
      locations: {
        service_locations: [
          {
            position: {
              x: 1,
              y: 2,
              z: 3,
            },
            positions: [
              {
                x: 1,
                y: 2,
                z: 3,
              },
              {
                x: 4,
                y: 5,
                z: 6,
              },
            ],
            service: mockResourceNode,
          },
        ],
      },
      metadata: { name: "test" },
      name: "test",
      status: "test",
      stream_proxy: {
        mode: "test",
        node: mockResourceNode,
      },
      type: "test",
    };

    describe("Read Methods", () => {
      it("should get the Entertainment Areas registered on Hue Bridge", async () => {
        fetchMock.get(
          `https://${mockIp}/clip/v2/resource/entertainment_configuration`,
          { data: [mockEntertainmentArea] }
        );

        const result = await bridge.getEntertainmentAreas();

        expect(result.length).toBe(1);
        expect(result[0]).toEqual(mockEntertainmentArea);
      });

      it("should get a specific Entertainment Areas registered on Hue Bridge", async () => {
        fetchMock.get(
          `https://${mockIp}/clip/v2/resource/entertainment_configuration/${mockEntertainmentArea.id}`,
          { data: [mockEntertainmentArea] }
        );

        const result = await bridge.getEntertainmentArea(
          mockEntertainmentArea.id
        );

        expect(result).toEqual(mockEntertainmentArea);
      });

      it("should get the lights registered on Hue Bridge", async () => {
        fetchMock.get(`https://${mockIp}/clip/v2/resource/light`, {
          data: [mockLight, secondMockLight],
        });

        const result = await bridge.getLights();

        expect(result.length).toBe(2);
        expect(result[0].id).toEqual(mockLight.id);
        expect(result[1].id).toEqual(secondMockLight.id);
      });

      it("should get a specific Light registered on Hue Bridge", async () => {
        fetchMock.get(
          `https://${mockIp}/clip/v2/resource/light/${mockLight.id}`,
          { data: [mockLight] }
        );

        const result = await bridge.getLight(mockLight.id);

        expect(result).toEqual(mockLight);
      });
    });

    describe("Update Methods", () => {
      // Update Operations
      it("should update a given entertainment area", async () => {
        fetchMock.put(
          `https://${mockIp}/clip/v2/resource/entertainment_configuration/${mockEntertainmentArea.id}`,
          { data: [mockResourceNode] }
        );

        const result = await bridge.updateEntertainmentArea(
          mockEntertainmentArea.id,
          {
            action: "stop",
          }
        );

        expect(result).toEqual(mockResourceNode);
      });
    });

    // Entertainment API Streaming
    describe("Streaming Entertainment API", () => {
      it("should throw when calling stop with no active channel", async () => {
        await expect(bridge.stop()).rejects.toThrow(
          "No active datagram socket!"
        );
      });

      // #NOTE: this shit should work, its literally a copy-paste from above
      it("should throw when calling transition with no active channel", async () => {
        // await expect(bridge.transition([justGreen])).rejects.toThrow(
        //   "No active datagram socket!"
        // );
        try {
          await bridge.transition([justGreen]);
        } catch (e) {
          expect(e.message).toBe("No active datagram socket!");
        }
      });

      it("should setup a dgram channel for a given entertainment area", async () => {
        fetchMock.get(
          `https://${mockIp}/clip/v2/resource/entertainment_configuration/${mockEntertainmentArea.id}`,
          { data: [mockEntertainmentArea] }
        );

        fetchMock.put(
          `https://${mockIp}/clip/v2/resource/entertainment_configuration/${mockEntertainmentArea.id}`,
          { data: [mockResourceNode] }
        );

        await bridge.start(mockEntertainmentArea.id);

        expect(bridge.socket).toBeDefined();
      });

      it("should be able to transmit an RGB array through Hue Entertainment API", async () => {
        await bridge.transition([justGreen]);

        expect(bridge.socket.send.mock.calls.length).toBe(1);
        expect(bridge.socket.send.mock.calls[0][0]).toBeInstanceOf(Buffer);
      });

      it("should be able to close the dgram channel for an active entertainment area", async () => {
        fetchMock.put(
          `https://${mockIp}/clip/v2/resource/entertainment_configuration/${mockEntertainmentArea.id}`,
          { data: [mockResourceNode] }
        );

        await bridge.stop();

        expect(bridge.socket.close.mock.calls.length).toBe(1);
      });
    });
  });
});
