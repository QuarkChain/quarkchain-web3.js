import QuarkChain from 'quarkchain-web3';
import Web3 from 'web3';

const web3 = new Web3();
QuarkChain.injectWeb3(web3, 'http://jrpc.testnet.quarkchain.io:38391')

// Needed in nodejs environment, otherwise would require MetaMask.
web3.qkc.setPrivateKey('0x0000000000000000000000000000000000000000000000000000000000000001');

console.log('eth address', web3.qkc.address);

const qkcAddress = QuarkChain.getQkcAddressFromEthAddress(web3.qkc.address);

const nonce = web3.qkc.getTransactionCount(qkcAddress);

console.log('nonce', nonce);

// Now `web3.qkc.sendTransaction()` should be available. Have fun.
