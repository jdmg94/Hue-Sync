<div align="center">

  <img src="assets/logo.png" alt="hue-sync" height="150" width="auto" />

  <p>
    A Typescript implementation of the Phillips Hue API V2
  </p>


<!-- Badges -->
<p>
  <a href="https://www.npmjs.com/package/hue-sync">
    <img src="https://img.shields.io/npm/v/hue-sync" alt="npm-version" />
  </a>
  <a href="https://github.com/jdmg94/hue-sync/graphs/contributors">
    <img src="https://img.shields.io/github/contributors/jdmg94/hue-sync" alt="contributors" />
  </a>
  <a href="">
    <img src="https://img.shields.io/github/last-commit/jdmg94/hue-sync" alt="last update" />
  </a>
  <a href="https://github.com/jdmg94/hue-sync/network/members">
    <img src="https://img.shields.io/github/forks/jdmg94/hue-sync" alt="forks" />
  </a>
  <a href="https://github.com/jdmg94/hue-sync/stargazers">
    <img src="https://img.shields.io/github/stars/jdmg94/hue-sync" alt="stars" />
  </a>
  <a href="https://github.com/jdmg94/hue-sync/issues/">
    <img src="https://img.shields.io/github/issues/jdmg94/hue-sync" alt="open issues" />
  </a>
  <a href="https://github.com/jdmg94/hue-sync/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/jdmg94/hue-sync.svg" alt="license" />
  </a>
</p>

<h4>
    <a href="https://github.com/jdmg94/hue-sync/README.md">Documentation</a>
  <span> · </span>
    <a href="https://github.com/jdmg94/hue-sync/issues/">Report Bug</a>
  <span> · </span>
    <a href="https://github.com/jdmg94/hue-sync/issues/">Request Feature</a>
  </h4>
</div>

<br />

<!-- Table of Contents -->
# Table of Contents

- [About the Project](#about-the-project)
- [Installation](#installation)
- [Usage](#usage)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgements](#acknowledgements)


<!-- About the Project -->
## About the Project

`Hue-Sync` is a library that was created from the ground up to provide a simple and easy way to interact with the Connected Lighting Interface Protocol better known as [Philips Hue API V2](https://developers.meethue.com/develop/hue-api-v2/). There's a few reasons you should consider `Hue-Sync` over other alternatives:

- it uses HTTPS
- it's written in Typescript
- it supports Gradient Lightstrip Zones

We aim to support as many features on the [official REST API Documentation](https://developers.meethue.com/develop/hue-api-v2/api-reference/) as possible.

<!-- Installation -->
## Installation

use your favourite package manager to install `Hue-Sync`:


```bash
  yarn add hue-sync
```
or 
```bash
  npm install hue-sync
```
or
```bash
  pnpm install hue-sync
```

<!-- Usage -->
## Usage

To get started you will want to find your bridge in the local network

```typescript
import HueSync from 'hue-sync'

const [myBridge] = await HueSync.discover()
 
mybridge.internalipaddress
// "192.168.0.15"
```

once you have found your bridge you need to register your app in order to get credentials

```typescript
const appName = "my-rgb-app"
const credentials = await HueSync.register(
  myBridge.internalipaddress, 
  appName
)

credentials.username
// 936C90F4AD975945038B6C83B5A8101A9C38EA7C
```

with the credentials and interal IP address you can now create a new `HueSync` instance and interact with the Hue Bridge directly.

```typescript
const hueBridge = new HueSync({
  credentials,
  url: myBridge.internalipaddress,
})
```


### Notes

Support for Gradient Lightstrip Zones is achieved via Entertainment Groups, make sure to create your entertainment groups via the official Phillips Hue App,
You should be able to assign a different color to each lightstrip zone by passing an array of `[R,G,B]` values (technically a vector, hope you get the gist) 



<!-- Roadmap -->
## Roadmap

*  Complete CRUD Operations
*  Constructor support to override HttpAgent
* ??
* profit

<!-- Contributing -->
## Contributing

<a href="https://github.com/jdmg94/hue-sync/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=jdmg94/hue-sync" />
</a>


Contributions are always welcome!




<!-- License -->
## License

Apache License 2.0, please checkout the LICENSE file for more information.

<!-- Contact -->
## Contact

José Muñoz - [@jdmg94](https://twitter.com/jdmg94) - jose.munoz.dev@pm.com


<!-- Acknowledgments -->
## Acknowledgements


Inspired by [node-phea](https://github.com/JakeBednard/node-phea), achieved using [node-dtls-client](https://github.com/AlCalzone/)
