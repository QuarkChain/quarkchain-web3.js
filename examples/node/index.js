import QuarkChain from 'quarkchain-web3';
import Web3 from 'web3';

const web3 = new Web3();
QuarkChain.injectWeb3(web3, 'http://jrpc.devnet.quarkchain.io:38391');

const mainnetNetworkId = '0x1';
const devnetNetworkId = '0xff';

// Needed in nodejs environment, otherwise would require MetaMask.
web3.qkc.setPrivateKey('0x0000000000000000000000000000000000000000000000000000000000000001');
const fullShardKey = '0x0005Fc90';

console.log('eth address', web3.qkc.address);

const tx = {
  gas: `0x${(30000).toString(16)}`,
  // Minimum gas price: 10gwei
  gasPrice: '0x2540be400',
  data: '0x',
  to: '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf0005Fc90',
  value: '0x0',
  networkId: devnetNetworkId,
  fromFullShardKey: fullShardKey,
  toFullShardKey: fullShardKey,
  transferTokenId: '0x8bb0',
  gasTokenId: '0x8bb0',
};

// Should be able to find tx ID in console.
web3.qkc.sendTransaction(tx, console.log);
