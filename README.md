# quarkchain-web3.js

[QuarkChain](https://quarkchain.io) client library provides the interfaces for DApps to interact with QuarkChain network.

The library is built on top of [web3.js](https://github.com/ethereum/web3.js). Though QuarkChain runs [Ethereum](https://www.ethereum.org/) Virtual Machine (EVM) and supports Ethereum smart contracts, due to the shard id encoding in the address and change of transaction data structure in QuarkChain the existing web3 library cannot work with QuarkChain JSON RPC directly without modification to handle the differences properly.

Instead of modifying the the web3 source code the quarkchain-web3.js library provides an interface (```QuarkChain.injectWeb3(web3, <JRPC URL>)```) to inject QuarkChain features into web3 instances. QuarkChain functions will be available in `web3.qkc` after injection and they mirror the same interfaces as their counterparts in `web3.eth` with two notable differences.

1. The addresses in QuarkChain are 24 bytes (48 hex chars)
2. The transaction object in QuarkChain optionally can have three extra properties than in Ethereum
   - `fromFullShardId`: 4 bytes fixed
   - `toFullShardId`: 4 bytes fixed
   - `networkId`: 4 bytes or less

The web3 instance passed into the injection function should manage user accounts and will be used to get account address (```web3.eth.accounts[0]```) and sign transactions (```eth_signTypedData```). The Ethereum provider of the web3 instance must support [eth_signTypedData](https://github.com/ethereum/EIPs/pull/712) which is implemented by [MetaMask](https://metamask.io). Follow this [doc](https://github.com/MetaMask/faq/blob/master/detecting_metamask.md) to integrate MetaMask.

This library is still under development and contributions and suggestions are welcome!

## Build and Use

To use for browsers, after cloning, can use `webpack` to build the client version of the library:

```bash
$ npm install  # Recommend node version 8 and above. add --no-shrinkwrap to keep current package-lock.json
$ npm run build  # Calls `webpack`.
$ less dist/quarkchain-web3.js  # Should be able to plug into browser directly.
```

Most likely you won't be able to use this library in Node since not many web3 providers have implemented `eth_signTypedData` which is needed by us. But in case you really want to try (also we recommend node >= 10 since [ndb](https://github.com/GoogleChromeLabs/ndb) is awesome):

```bash
# ES5, with babel.
$ npm run build:node
# Build and start interacting using ndb.
$ npm run run:node
```

Then in the console:

```javascript
const QuarkChain = require('./dist/index.js');
const Web3 = require('web3')
const web3 = new Web3();

QuarkChain.injectWeb3(web3, QKC_JRPC_URL)
```

## API Reference

- QuarkChain
  - [getFullShardIdFromEthAddress](#quarkchaingetfullshardidfromethaddress)
  - [getFullShardIdFromQkcAddress](#quarkchaingetfullshardidfromqkcaddress)
  - [getEthAddressFromQkcAddress](#quarkchaingetethaddressfromqkcaddress)
  - [getQkcAddressFromEthAddress](#quarkchaingetqkcaddressfromethaddress)
  - [injectWeb3](#quarkchaininjectweb3)
- web3
  - [qkc](#web3qkc)
    - [getBalance](#web3qkcgetbalance)
    - [getTransactionCount](#web3qkcgettransactioncount)
    - [sendTransaction](#web3qkcsendtransaction)
    - [getTransactionReceipt](#web3qkcgettransactionreceipt)
    - [call](#web3qkccall)
    - [contract](#web3qkccontract)
    - [contract methods](#contract-methods)
    - [setPrivateKey](#web3qkcsetprivatekey)

#### QuarkChain.getFullShardIdFromEthAddress

```js
QuarkChain.getFullShardIdFromEthAddress(ethAddressHexString)
```

Calculates the full shard id from ETH address.

##### Parameters

1. `String` - ETH address as HEX string.

##### Returns

`String` - Full shard id as HEX string.

##### Example

```js
var result = QuarkChain.getFullShardIdFromEthAddress("0x653EF52aa0D9f9186f3f311193C92Ed84707519C");
console.log(result);  // "0x65D931d8"
```

#### QuarkChain.getFullShardIdFromQkcAddress

```js
QuarkChain.getFullShardIdFromQkcAddress(qkcAddressHexString)
```

Extracts full shard id from QKC address.

##### Parameters

1. `String` - QKC address as HEX string.

##### Returns

`String` - Full shard id as HEX string.

##### Example

```js
var result = QuarkChain.getFullShardIdFromQkcAddress("0x653EF52aa0D9f9186f3f311193C92Ed84707519C65D931d8");
console.log(result);  // "0x65D931d8"
```

#### QuarkChain.getEthAddressFromQkcAddress

```js
QuarkChain.getEthAddressFromQkcAddress(qkcAddressHexString)
```

Extracts ETH address from QKC address.

##### Parameters

1. `String` - QKC address as HEX string.

##### Returns

`String` - ETH address as HEX string.

##### Example

```js
var result = QuarkChain.getEthAddressFromQkcAddress("0x653EF52aa0D9f9186f3f311193C92Ed84707519C65D931d8");
console.log(result);  // "0x653EF52aa0D9f9186f3f311193C92Ed84707519C"
```

#### QuarkChain.getQkcAddressFromEthAddress

```js
QuarkChain.getQkcAddressFromEthAddress(ethAddressHexString)
```

Converts ETH address to QKC address deterministically.

##### Parameters

1. `String` - ETH address as HEX string.

##### Returns

`String` - QKC address as HEX string.

##### Example

```js
var result = QuarkChain.getQkcAddressFromEthAddress("0x653EF52aa0D9f9186f3f311193C92Ed84707519C");
console.log(result);  // "0x653EF52aa0D9f9186f3f311193C92Ed84707519C65D931d8"
```

#### QuarkChain.injectWeb3

```js
QuarkChain.injectWeb3(web3, QkcJrpcUrl)
```

Add QuarkChain specific functions to the web3 instance. [web3.qkc](#web3qkc) will be available after this call.

##### Parameters

1. `Web3` - Web3 instance
2. `String` - URL for QuarkChain JRPC endpoint

##### Example

```js
QuarkChain.injectWeb3(web3, QKC_JRPC_URL);
console.log(!!web3.qkc);  // true
```

------

### Acknowledgement

The following API references are copied from [Ethereum JavaScript API](https://github.com/ethereum/wiki/wiki/JavaScript-API) with modifications to match QuarkChain interfaces including function parameters and examples. We appreciate the efforts from people contributing to both docs.

#### web3.qkc

Provides QuarkChain methods.

##### Example

```js
var qkc = web3.qkc;
```

#### web3.qkc.getBalance

```js
web3.qkc.getBalance(addressHexString [, callback])
```

Get the balance of an address at the latest block.

##### Parameters

1. ```String``` - The address to get the balance of.
2. ```Function``` - (optional) If you pass a callback the HTTP request is made asynchronous.
   See [this note](https://github.com/ethereum/wiki/wiki/JavaScript-API#using-callbacks) for details.

##### Returns

```String``` - A BigNumber instance of the current balance for the given address in wei.
See the [note on BigNumber](https://github.com/ethereum/wiki/wiki/JavaScript-API#a-note-on-big-numbers-in-web3js).

##### Example

```javascript
var balance = web3.qkc.getBalance("0x653EF52aa0D9f9186f3f311193C92Ed84707519C65D931d8");
console.log(balance);  // instanceof BigNumber
console.log(balance.toString(10));  // '1000000000000'
console.log(balance.toNumber());  // 1000000000000
```

#### web3.qkc.getTransactionCount

```javascript
web3.qkc.getTransactionCount(addressHexString [, callback])
```

Get the numbers of transactions sent from this address.

##### Parameters

1. ```String``` - The address to get the numbers of transactions from.
2. ```Function``` - (optional) If you pass a callback the HTTP request is made asynchronous.
   See [this note](https://github.com/ethereum/wiki/wiki/JavaScript-API#using-callbacks) for details.

##### Returns

```Number``` - The number of transactions sent from the given address.

##### Example

```javascript
var number = web3.qkc.getTransactionCount("0x653EF52aa0D9f9186f3f311193C92Ed84707519C65D931d8");
console.log(number);  // 12
```

#### web3.qkc.sendTransaction

```js
web3.qkc.sendTransaction(transactionObject [, callback])
```

Sends a transaction to the network.
`web3.eth.accounts[0]` will be used to sign the transaction.
`nonce` in the transaction object will be fetched from the network automatically.

##### Parameters

1. `Object` - The transaction object to send:

- `to`: `String` - (optional) The destination address of the message, left undefined for a contract-creation transaction.
- `value`: `Number|String|BigNumber` - (optional) The value transferred for the transaction in Wei, also the endowment if it's a contract-creation transaction.
- `gas`: `Number|String|BigNumber` - (optional, default: 0) The amount of gas to use for the transaction (unused gas is refunded).
- `gasPrice`: `Number|String|BigNumber` - (optional, default: 0) The price of gas for this transaction in wei.
- `data`: `String` - (optional) Either a [byte string](https://github.com/ethereum/wiki/wiki/Solidity,-Docs-and-ABI) containing the associated data of the message, or in the case of a contract-creation transaction, the initialisation code.
- `fromFullShardId`: `String` - (optional, default: `QuarkChain.getFullShardIdFromEthAddress(web3.eth.accounts[0])`) The full shard id for sender.
- `toFullShardId`: `String` - (optional, default: `QuarkChain.getFullShardIdFromQkcAddress(to)`) The full shard id for the to address.

1. `Function` - (optional) If you pass a callback the HTTP request is made asynchronous.
   See [this note](https://github.com/ethereum/wiki/wiki/JavaScript-API#using-callbacks) for details.

##### Returns

`String` - The 36 Bytes transaction id as HEX string.

If the transaction was a contract creation use [web3.qkc.getTransactionReceipt()](#web3qkcgettransactionreceipt) to get the contract address, after the transaction was mined.

##### Example

```js
// compiled solidity source code
var code = "0x603d80600c6000396000f3007c01000000000000000000000000000000000000000000000000000000006000350463c6888fa18114602d57005b6007600435028060005260206000f3";

web3.qkc.sendTransaction({data: code, gas: 1000000}, function(err, transactionId) {
  if (!err)
    console.log(transactionId); // "0xff49f2d47b9b92ad5ec66c2cd1790ec57cdf04bb6fc783fd17b55894ef11eeba65d931d8"
});
```

#### web3.qkc.getTransactionReceipt

```js
web3.qkc.getTransactionReceipt(transactionIdHexString [, callback])
```

Returns the receipt of a transaction by transaction id.

**Note** That the receipt is not available for pending transactions.

##### Parameters

1. `String` - The transaction id.
2. `Function` - (optional) If you pass a callback the HTTP request is made asynchronous.
   See [this note](https://github.com/ethereum/wiki/wiki/JavaScript-API#using-callbacks) for details.

##### Returns

`Object` - A transaction receipt object, or `null` when no receipt was found:

- `blockHash`: `String`, 32 Bytes - hash of the block where this transaction was in.
- `blockHeight`: `Number` - block number where this transaction was in.
- `transactionId`: `String`, 36 Bytes - id of the transaction.
- `transactionHash`: `String`, 32 Bytes - hash of the transaction.
- `transactionIndex`: `Number` - integer of the transactions index position in the block.
- `cumulativeGasUsed `: `Number ` - The total amount of gas used when this transaction was executed in the block.
- `gasUsed `: `Number ` -  The amount of gas used by this specific transaction alone.
- `contractAddress `: `String` - 20 Bytes - The contract address created **without full shard id**, if the transaction was a contract creation, otherwise `null`.
    To build a QKC contract address, append the toFullShardId used in the contract creation transaction.
    Normally you should use web3.qkc.contract(abi).new() which returns the QKC address in the callback.
- `status `:  `String` - '0x0' indicates transaction failure , '0x1' indicates transaction succeeded.

##### Example

```js
var receipt = web3.qkc.getTransactionReceipt('0xff49f2d47b9b92ad5ec66c2cd1790ec57cdf04bb6fc783fd17b55894ef11eeba65d931d8');
console.log(receipt);
{
  blockHash: "0xfbc12d5c9b2b382bfc7efcd0843bd06b7e2f3ae0188627bc12599fce4ce9276f",
  blockHeight: "0x369",
  blockId: "0xfbc12d5c9b2b382bfc7efcd0843bd06b7e2f3ae0188627bc12599fce4ce9276f00000018",
  contractAddress: "0xd08305d78c6df48c312c46125b919a79b3127397",
  cumulativeGasUsed: 67954,
  gasUsed: 67954,
  status: "0x1",
  transactionHash: "0xff49f2d47b9b92ad5ec66c2cd1790ec57cdf04bb6fc783fd17b55894ef11eeba",
  transactionId: "0xff49f2d47b9b92ad5ec66c2cd1790ec57cdf04bb6fc783fd17b55894ef11eeba65d931d8",
  transactionIndex: 0
}
```

#### web3.qkc.call

```js
web3.qkc.call(callObject [, callback])
```

Executes a message call transaction, which is directly executed in the VM of the node, but never mined into the blockchain.

##### Parameters

1. `Object` - A transaction object see [web3.qkc.sendTransaction](#web3qkcsendtransaction), with the difference that for calls the `from` property is optional as well.
2. `Function` - (optional) If you pass a callback the HTTP request is made asynchronous.
   See [this note](https://github.com/ethereum/wiki/wiki/JavaScript-API#using-callbacks) for details.

##### Returns

`String` - The returned data of the call, e.g. return value of a smart contract function.

##### Example

```js
var result = web3.qkc.call({
    to: "0xD08305d78C6DF48c312c46125B919A79B312739765D931d8",
    data: "0xc6888fa10000000000000000000000000000000000000000000000000000000000000003"
});
console.log(result); // "0x0000000000000000000000000000000000000000000000000000000000000015"
```

------

#### web3.qkc.contract

```js
web3.qkc.contract(abiArray)
```

Creates a contract object for a solidity contract, which can be used to initiate contracts on an address.
You can read more about events [here](https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI#example-javascript-usage).

##### Parameters

1. `Array` - ABI array with descriptions of functions and events of the contract.

##### Returns

`Object` - A contract object, which can be initiated as follows:

```js
var MyContract = web3.qkc.contract(abiArray);

// instantiate by address
var contractInstance = MyContract.at(address);

// deploy new contract
var contractInstance = MyContract.new([constructorParam1] [, constructorParam2], {data: '0x12345...', from: myAccount, gas: 1000000});

// Get the data to deploy the contract manually
var contractData = MyContract.new.getData([constructorParam1] [, constructorParam2], {data: '0x12345...'});
// contractData = '0x12345643213456000000000023434234'
```

And then you can either initiate an existing contract on an address,
or deploy the contract using the compiled byte code:

```js
// Instantiate from an existing address:
var myContractInstance = MyContract.at(myContractAddress);


// Or deploy a new contract:

// Deploy the contract asynchronous from Solidity file:
...
const fs = require("fs");
const solc = require('solc')

let source = fs.readFileSync('nameContract.sol', 'utf8');
let compiledContract = solc.compile(source, 1);
let abi = compiledContract.contracts['nameContract'].interface;
let bytecode = compiledContract.contracts['nameContract'].bytecode;
let MyContract = web3.eth.contract(JSON.parse(abi));

var myContractReturned = MyContract.new(param1, param2, {
   data: bytecode,
   gas: 1000000}, function(err, myContract){
    if(!err) {
       // NOTE: The callback will fire twice!
       // Once the contract has the transactionId property set and once its deployed on an address.

       // e.g. check tx hash on the first call (transaction send)
       if(!myContract.address) {
           console.log(myContract.transactionId); // The id of the transaction, which deploys the contract

       // check address on the second call (contract deployed)
       } else {
           console.log(myContract.address); // the contract address
       }

       // Note that the returned "myContractReturned" === "myContract",
       // so the returned "myContractReturned" object will also get the address set.
    }
  });
```

##### Example

```js
// contract abi
var abi = [{
     name: 'myConstantMethod',
     type: 'function',
     constant: true,
     inputs: [{ name: 'a', type: 'string' }],
     outputs: [{name: 'd', type: 'string' }]
}, {
     name: 'myStateChangingMethod',
     type: 'function',
     constant: false,
     inputs: [{ name: 'a', type: 'string' }, { name: 'b', type: 'int' }],
     outputs: []
}, {
     name: 'myEvent',
     type: 'event',
     inputs: [{name: 'a', type: 'int', indexed: true},{name: 'b', type: 'bool', indexed: false}]
}];

// creation of contract object
var MyContract = web3.qkc.contract(abi);

// initiate contract for an address
var myContractInstance = MyContract.at('0xD08305d78C6DF48c312c46125B919A79B312739765D931d8');

// call constant function
var result = myContractInstance.myConstantMethod('myParam');
console.log(result) // '0x25434534534'

// send a transaction to a function
myContractInstance.myStateChangingMethod('someParam1', 23, {value: 200, gas: 2000});

// short hand style
web3.qkc.contract(abi).at(address).myAwesomeMethod(...);
```

#### Contract Methods

```js
// Automatically determines the use of call or sendTransaction based on the method type
myContractInstance.myMethod(param1 [, param2, ...] [, transactionObject] [, callback]);

// Explicitly calling this method
myContractInstance.myMethod.call(param1 [, param2, ...] [, transactionObject] [, callback]);

// Explicitly sending a transaction to this method
myContractInstance.myMethod.sendTransaction(param1 [, param2, ...] [, transactionObject] [, callback]);

// Get the call data, so you can call the contract through some other means
// var myCallData = myContractInstance.myMethod.request(param1 [, param2, ...]);
var myCallData = myContractInstance.myMethod.getData(param1 [, param2, ...]);
// myCallData = '0x45ff3ff6000000000004545345345345..'
```

The contract object exposes the contract's methods, which can be called using parameters and a transaction object.

##### Parameters

- `String|Number|BigNumber` - (optional) Zero or more parameters of the function. If passing in a string, it must be formatted as a hex number, e.g. "0xdeadbeef" If you have already created BigNumber object, then you can just pass it too.
- `Object` - (optional) The (previous) last parameter can be a transaction object, see [web3.qkc.sendTransaction](#web3qkcsendtransaction) parameter 1 for more. **Note**: `data` and `to` properties will not be taken into account.
- `Function` - (optional) If you pass a callback as the last parameter the HTTP request is made asynchronous.
  See [this note](https://github.com/ethereum/wiki/wiki/JavaScript-API#using-callbacks) for details.

##### Returns

`String` - If its a call the result data, if its a send transaction a created contract address, or the transaction id, see [web3.qkc.sendTransaction](#web3qkcsendtransaction) for details.

##### Example

```js
// creation of contract object
var MyContract = web3.qkc.contract(abi);

// initiate contract for an address
var myContractInstance = MyContract.at('0xD08305d78C6DF48c312c46125B919A79B312739765D931d8');

var result = myContractInstance.myConstantMethod('myParam');
console.log(result);  // '0x25434534534'

myContractInstance.myStateChangingMethod('someParam1', 23, {value: 200, gas: 2000}, function(err, result){ ... });
```

#### web3.qkc.setPrivateKey
You can skip MetaMask by providing the private key (a bit hacky but works) after injecting web3. This will make the library work in Node environment.
```js
// Note the private key is a 32-byte hex string.
web3.qkc.setPrivateKey('0x...');
// Or unset and go back to MetaMask.
web3.qkc.unsetPrivateKey();
// Then continue with sendTransaction or contract methods (write), remember to set gasLimit and gasPrice correctly
```

------
