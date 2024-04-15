# Disperse SPL_Token/Sol to investors

**Solana Rust contract & Node.js backend service.**

 * Rust v1.77.2
 * Node.js v18.19.0
 * anchor v0.28.0
 * avm v0.28.0

>Note: Developed in Ubuntu 22.04

Install latest last version and anchor.
After installing anchor, ```avm install 0.28.0``` and use avm 0.28.0.

set the publickey and privatekey of token distribution wallet address in the app/.env file and generate id.json file using keygen.js.

copy the id.json to the ../ folder and execute ```solana config set --keypair ./id.json```.

change the /target/deploy/disperse-keypair.json content with id.json.

```anchor build```

```anchor test```


## Overview

### Installation

#### Contract Deploy

To deploy the smart contract to the solana network, execute this instruction.

```shell
$ anchor build
$ anchor deploy
```

After complete the deploying run the backend.
Backend developed simple vanilla JS and used ```setInterval()``` function for balance check and distribution.

* time set

```JS
setInterval(async () => {
  processing = true;
  const fromKp = provider.wallet.payer;
  const mintKp = new web3.Keypair();
  const mint = await createMint(
    program.provider.connection,
    provider.wallet.payer,
    fromKp.publicKey,
    null,
    0
  );
  checkTokenBalance(mint);
  setTimeout(() => {
    processing = false;
  }, 10000);
}, 60000 // time Interval(ms));
```

#### Backend running

* .env set
```env
PORT = //backend server running port ex: 3000

ANCHOR_PROVIDER_URL = //web3 provider url ex: https://api.testnet.solana.com

ANCHOR_WALLET = // keypair url ex: ../id.json

PRIVATE_KEY = // phantom wallet private key(it used to generate keypair file - id.json from your phantom wallet) 

PUBLIC_KEY = // phantom wallet public key(it used to generate keypair file - id.json from your phantom wallet) 
```

```shell
$ cd app
$ npm start
```

You can see ```Server stated on port: 3000```.
You can set the port in the .env file.

### Usage


To deploy rust smart contract to the solana network, First have to build contract.

Rust contract build:

```shell
anchor build
```

After complete the building, deploy the contract to the solana network.

Rust contract deploy:

```shell
anchor deploy
```

To test your contract with test code, execute this instruction.

Rust contract test:

```shell
anchor test
```

### Generate keypair from Phantom Wallet Address

set the public key and private key of your phantom wallet exactly in the .env file.
execute instruction to generate keypair
```shell
node keygen.js
```

You can see the `id.json` file.