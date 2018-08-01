// QuarkChain client library built on web3.js
//
// Call QuarkChain.injectWeb3(web3, jrpcUrl) to inject qkc object.
// The functions provided by the web3.qkc object mirror the corresponding ones in web3.eth.
// One notable difference is that the qkc functions accepts QuarkChain address (48 hex chars).
//
// Available functions:
//     getBalance: $QKC_ADDRESS
//     getTransactionCount: $QKC_ADDRESS
//     call: {to: $QKC_ADDRESS, ...}
//     sendTransaction:
//     {
//       to: $QKC_ADDRESS,
//       fromFullShardId (optional): $NUMBER,
//       toFullShardId (optional): $NUMBER,
//       ...
//     }, nonce is fetched from network
//     getTransactionReceipt: $TX_ID
//     contract: $ABI
//         new:
//         at: $QKC_ADDRESS
//
// Example:
//     QuarkChain.injectWeb3(web3, "http://jrpc.quarkchain.io:38391");
//     const ethAddr = web3.eth.accounts[0];
//     const qkcAddr = QuarkChain.getQkcAddressFromEthAddress(ethAddr);
//     web3.qkc.getBalance(qkcAddr).toString(10);

import ethUtil from 'ethereumjs-util';

import Transaction from './quarkchain-ethereum-tx';

function assert(condition, msg) {
  if (!condition) {
    throw msg;
  }
}

function getFullShardIdFromEthAddress(ethAddress) {
  assert(ethAddress.length === 42, 'Invalid eth address');
  let fullShardId = '';
  for (let i = 2; i < 42; i += 10) {
    fullShardId += ethAddress.slice(i, i + 2);
  }
  return `0x${fullShardId}`;
}

function getFullShardIdFromQkcAddress(qkcAddress) {
  assert(qkcAddress.length === 50, 'Invalid qkc address');
  return `0x${qkcAddress.slice(-8)}`;
}

function getQkcAddressFromEthAddress(ethAddress) {
  assert(ethAddress.length === 42, 'Invalid eth address');
  const fullShardId = getFullShardIdFromEthAddress(ethAddress);
  return `${ethAddress}${fullShardId.slice(2)}`;
}

function getEthAddressFromQkcAddress(qkcAddress) {
  assert(qkcAddress.length === 50, 'Invalid qkc address');
  return qkcAddress.slice(0, 42);
}

function getTypedTx(tx) {
  const msgParams = [
    {
      type: 'uint256',
      name: 'nonce',
      value: `0x${tx.nonce.toString('hex')}`,
    },
    {
      type: 'uint256',
      name: 'gasPrice',
      value: `0x${tx.gasPrice.toString('hex')}`,
    },
    {
      type: 'uint256',
      name: 'gasLimit',
      value: `0x${tx.gasLimit.toString('hex')}`,
    },
    {
      type: 'uint160',
      name: 'to',
      value: `0x${tx.to.toString('hex')}`,
    },
    {
      type: 'uint256',
      name: 'value',
      value: `0x${tx.value.toString('hex')}`,
    },
    {
      type: 'bytes',
      name: 'data',
      value: `0x${tx.data.toString('hex')}`,
    },
    {
      type: 'uint32',
      name: 'fromFullShardId',
      value: `0x${tx.fromFullShardId.toString('hex')}`,
    },
    {
      type: 'uint32',
      name: 'toFullShardId',
      value: `0x${tx.toFullShardId.toString('hex')}`,
    },
    {
      type: 'uint256',
      name: 'networkId',
      value: `0x${tx.networkId.toString('hex')}`,
    },
    {
      type: 'string',
      name: 'qkcDomain',
      value: 'bottom-quark',
    },
  ];
  return msgParams;
}

async function metaMaskSignTyped(web3in, tx) {
  return new Promise((resolve, reject) => {
    const from = web3in.eth.accounts[0];
    const params = [getTypedTx(tx), from];
    const method = 'eth_signTypedData';
    web3in.currentProvider.sendAsync(
      {
        method,
        params,
        from,
      },
      (err, result) => {
        if (err) {
          return reject(err);
        }
        if (result.error !== undefined) {
          return reject(result.error);
        }
        return resolve(result.result);
      },
    );
  });
}

function decodeSignature(sig) {
  const ret = {};
  const signature = sig.slice(2);
  ret.r = ethUtil.toBuffer(`0x${signature.slice(0, 64)}`);
  ret.s = ethUtil.toBuffer(`0x${signature.slice(64, 128)}`);
  ret.v = ethUtil.toBuffer(`0x${signature.slice(128, 130)}`);
  return ret;
}

function loadContract(abi, contractAddress, web3in, web3http) {
  const web3contract = new Web3(web3http.currentProvider);

  // Override call and sendTransaction to include full shard id
  web3contract.eth.call = (obj, blockId, callback) => {
    const ret = web3in.qkc.call(Object.assign({}, obj, { to: contractAddress }), callback);
    return ret;
  };

  web3contract.eth.sendTransaction = async (obj, callback) => {
    const ret = await web3in.qkc.sendTransaction(
      Object.assign({}, obj, { to: contractAddress }),
      callback,
    );
    return ret;
  };
  return web3contract.eth.contract(abi).at(contractAddress.slice(0, 42));
}

export default {
  getFullShardIdFromEthAddress,

  getFullShardIdFromQkcAddress,

  getQkcAddressFromEthAddress,

  getEthAddressFromQkcAddress,

  injectWeb3(web3in, jrpcUrl) {
    // Inject QuarkChain specific logic into the provided web3 instance.
    //
    // The web3 instance passed in will be used for account management and signing transactions.
    // It should have a provider implementing RPC eth_signTypedData (https://github.com/ethereum/EIPs/pull/712)
    // Normally you should just pass in a web3 instance with provider from MetaMask.
    //
    // FIXME: networkId is hard coded 0x3 for testnet
    //
    // Args:
    //     web3in: web3 instance
    //     jrpcUrl: QuarkChain JSON RPC endpoint (e.g., http://localhost:38391)

    const web3http = new Web3(new Web3.providers.HttpProvider(jrpcUrl));

    // eslint-disable-next-line
    web3in.qkc = {
      getBalance(qkcAddress, callback) {
        const ethAddress = getEthAddressFromQkcAddress(qkcAddress);
        const shard = getFullShardIdFromQkcAddress(qkcAddress);
        return web3http.eth.getBalance(ethAddress, shard, callback);
      },

      getTransactionCount(qkcAddress, callback) {
        const ethAddress = getEthAddressFromQkcAddress(qkcAddress);
        const shard = getFullShardIdFromQkcAddress(qkcAddress);
        return web3http.eth.getTransactionCount(ethAddress, shard, callback);
      },

      call(obj, callback) {
        const qkcAddress = obj.to;
        const qkcObj = Object.assign({}, obj, {
          to: getEthAddressFromQkcAddress(qkcAddress),
        });
        const shard = getFullShardIdFromQkcAddress(qkcAddress);
        return web3http.eth.call(qkcObj, shard, callback);
      },

      async sendTransaction(obj, callback) {
        const fromEthAddress = web3in.eth.accounts[0];
        const qkcObj = Object.assign({}, obj);
        if (obj.fromFullShardId === undefined) {
          qkcObj.fromFullShardId = getFullShardIdFromEthAddress(fromEthAddress);
        }
        if (obj.toFullShardId === undefined) {
          if (obj.to === undefined) {
            // contract creation
            qkcObj.toFullShardId = obj.fromFullShardId;
          } else {
            qkcObj.toFullShardId = getFullShardIdFromQkcAddress(obj.to);
          }
        }
        if (obj.to !== undefined) {
          qkcObj.to = getEthAddressFromQkcAddress(obj.to);
        }

        // FIXME: make this async
        qkcObj.nonce = web3http.eth.getTransactionCount(
          fromEthAddress,
          obj.fromFullShardId,
        );
        qkcObj.networkId = '0x3';
        qkcObj.version = '0x1';

        const tx = new Transaction(qkcObj)();
        // To sign with a key
        // var key = "0x...";
        // tx.sign(ethUtil.toBuffer(key));
        // tx.version = 1;

        try {
          const sig = await metaMaskSignTyped(web3in, tx);
          Object.assign(tx, decodeSignature(sig));
        } catch (error) {
          console.log(error); // eslint-disable-line
          return;
        }
        const payload = `0x${tx.serialize().toString('hex')}`;
        web3http.eth.sendRawTransaction(payload, callback);
      },

      getTransactionReceipt: web3http.eth.getTransactionReceipt,

      getCode(qkcAddr) {
        return web3http.eth.getCode(getEthAddressFromQkcAddress(qkcAddr));
      },

      contract(abi) {
        const contractFactory = web3in.eth.contract(abi);
        const originalFactory = web3in.eth.contract(abi);
        contractFactory.at = addr => loadContract(abi, addr, web3in, web3http);
        contractFactory.new = (...args) => {
          const size = args.length;
          const callback = args[size - 1];
          const obj = args[size - 2];
          const newArguments = [];
          for (let i = 0; i < size - 1; i += 1) {
            newArguments.push(args[i]);
          }
          return originalFactory.new(...newArguments, (error, contract) => {
            const contractOverride = Object.assign({}, contract);
            if (contract.address) {
              // contract.address is ETH address
              contractOverride.address += obj.toFullShardId.slice(2);
            } else {
              // The transactionHash returned from eth_sendRawTransaction is already a tx id
              contractOverride.transactionId = contract.transactionHash;
            }
            callback(error, contractOverride);
          });
        };
        contractFactory.new.getData = originalFactory.new.getData;
        return contractFactory;
      },
    };

    // Override eth_sendTransaction to support Contract.new
    web3in.eth.sendTransaction = web3in.qkc.sendTransaction; // eslint-disable-line

    // Override eth_getTransactionReceipt to support Contract.new
    web3in.eth.getTransactionReceipt = web3in.qkc.getTransactionReceipt; // eslint-disable-line

    // Override eth_getCode to support Contract.new
    web3in.eth.getCode = web3in.qkc.getCode; // eslint-disable-line
  },
};
