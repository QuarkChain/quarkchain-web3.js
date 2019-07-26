```
$ npm install
$ node_modules/.bin/babel index.js -d dist && node dist/index.js

index.js -> dist/index.js
eth address 0x7e5f4552091a69125d5dfcb7b8c2659029395bdf
null '0xa09a05c27f70cb0a5c0e5baa9ba3d0b8fe5e0ae28911bb7bf7e728673b0b86f40005fc90'
```

Remember to edit the 32-byte private key inside the script before running it. By default the script is for devnet.

The transaction ID is shown after execution. Then go to devnet to check the transaction, which is devnet.quarkchain.io/tx/(tx_id) and plug in the correct transaction ID.

To run the script for mainnet, update the script by changing the JSONRPC endpoint (the line starts with `QuarkChain.injectWeb3`) to either your local cluster or our public endpoint (`http://jrpc.mainnet.quarkchain.io:38391`), **AND** update `networkId` field to use `mainnetNetworkId`.
