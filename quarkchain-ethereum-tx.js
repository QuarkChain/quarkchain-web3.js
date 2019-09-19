// Modified [ethereumjs-tx](https://github.com/ethereumjs/ethereumjs-tx/blob/master/index.js)
// to add shard-related fields.

const ethUtil = require('ethereumjs-util');
const rlp = require('rlp');
const fees = require('ethereum-common/params.json');

const BN = ethUtil.BN;

// secp256k1n/2
const N_DIV_2 = new BN(
  '7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0',
  16,
);

/**
 * Creates a new transaction object.
 *
 * @example
 * var rawTx = {
 *   nonce: '0x00',
 *   gasPrice: '0x09184e72a000',
 *   gasLimit: '0x2710',
 *   to: '0x0000000000000000000000000000000000000000',
 *   value: '0x00',
 *   data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
 *   v: '0x1c',
 *   r: '0x5e1d3a76fbf824220eafc8c79ad578ad2b67d01b0c2425eb1f1347e8f50882ab',
 *   s: '0x5bd428537f05f9830e93792f90ea6a3e2d1ee84952dd96edbae9f658f831ab13'
 * };
 * var tx = new Transaction(rawTx);
 *
 * @class
 * @param {Buffer | Array | Object} data a transaction can be initiailized with either a buffer
 *   containing the RLP serialized transaction or an array of buffers relating to each of the
 *   tx Properties, listed in order below in the exmple.
 *
 * Or lastly an Object containing the Properties of the transaction like in the Usage example.
 *
 * For Object and Arrays each of the elements can either be a Buffer, a hex-prefixed (0x) String,
 *   Number, or an object with a toBuffer method such as Bignum
 *
 * @property {Buffer} raw The raw rlp encoded transaction
 * @param {Buffer} data.nonce nonce number
 * @param {Buffer} data.gasLimit transaction gas limit
 * @param {Buffer} data.gasPrice transaction gas price
 * @param {Buffer} data.to to the to address
 * @param {Buffer} data.value the amount of ether sent
 * @param {Buffer} data.data this will contain the data of the message or the init of a contract
 * @param {Buffer} data.v EC recovery ID
 * @param {Buffer} data.r EC signature parameter
 * @param {Buffer} data.s EC signature parameter
 * @param {Number} data.chainId EIP 155 chainId - mainnet: 1, ropsten: 3
 * */

class Transaction {
  constructor(data) {
    data = data || {};
    // Define Properties
    const fields = [
      {
        name: 'nonce',
        length: 32,
        allowLess: true,
        default: new Buffer([]),
      },
      {
        name: 'gasPrice',
        length: 32,
        allowLess: true,
        default: new Buffer([]),
      },
      {
        name: 'gasLimit',
        alias: 'gas',
        length: 32,
        allowLess: true,
        default: new Buffer([]),
      },
      {
        name: 'to',
        allowZero: true,
        length: 20,
        default: new Buffer([]),
      },
      {
        name: 'value',
        length: 32,
        allowLess: true,
        default: new Buffer([]),
      },
      {
        name: 'data',
        alias: 'input',
        allowZero: true,
        default: new Buffer([]),
      },
      {
        name: 'networkId',
        length: 32,
        allowLess: true,
        default: new Buffer([]),
      },
      {
        name: 'fromFullShardKey',
        length: 4,
      },
      {
        name: 'toFullShardKey',
        length: 4,
      },
      {
        name: 'gasTokenId',
        length: 8,
        allowLess: true,
        default: new Buffer([]),
      },
      {
        name: 'transferTokenId',
        length: 8,
        allowLess: true,
        default: new Buffer([]),
      },
      {
        name: 'version',
        length: 32,
        allowLess: true,
        default: new Buffer([]),
      },
      {
        name: 'v',
        allowZero: true,
        default: new Buffer([0x1c]),
      },
      {
        name: 'r',
        length: 32,
        allowZero: true,
        allowLess: true,
        default: new Buffer([]),
      },
      {
        name: 's',
        length: 32,
        allowZero: true,
        allowLess: true,
        default: new Buffer([]),
      },
    ];

    /**
     * Returns the rlp encoding of the transaction
     * @method serialize
     * @return {Buffer}
     * @memberof Transaction
     * @name serialize
     */
    // attached serialize
    ethUtil.defineProperties(this, fields, data);

    /**
     * @property {Buffer} from (read only) sender address of this transaction, mathematically
     *   derived from other parameters.
     * @name from
     * @memberof Transaction
     */
    Object.defineProperty(this, 'from', {
      enumerable: true,
      configurable: true,
      get: this.getSenderAddress.bind(this),
    });

    // calculate chainId from signature
    const sigV = ethUtil.bufferToInt(this.v);
    let chainId = Math.floor((sigV - 35) / 2);
    if (chainId < 0) chainId = 0;

    // set chainId
    this._chainId = chainId || data.chainId || 0;
    this._homestead = true;
  }

  /**
   * If the tx's `to` is to the creation address
   * @return {Boolean}
   */
  toCreationAddress() {
    return this.to.toString('hex') === '';
  }

  /**
   * Computes a sha3-256 hash of the serialized tx
   * @param {Boolean} [includeSignature=true] whether or not to include the signature
   * @return {Buffer}
   */
  hash(includeSignature) {
    if (includeSignature === undefined) {
      includeSignature = true;
    }

    let items;
    if (includeSignature) {
      items = this.raw;
      return this.txHash(items);
    }
    // Excludes v, r, s and version.
    items = this.raw.slice(0, 11);


    return ethUtil.rlphash(items);
  }

  qkcHash() {
    // Require signatures are present.
    for (const sig of [this.r, this.s]) {
      if (sig.toString() === '') {
        throw new Error('cannot call qkcHash on unsigned tx');
      }
    }
    const rlpResult = rlp.encode(this.raw);
    let len = rlpResult.length;
    const buf = new Buffer(5 + len);
    for (let i = len + 4; i >= 0; i--) {
      if (i < 5) {
        buf[i] = len % 256;
        len = Math.floor(len / 256);
      } else {
        buf[i] = rlpResult[i - 5];
      }
    }
    buf[0] = 0;
    return ethUtil.keccak(buf);
  }

  /**
   * returns chain ID
   * @return {Buffer}
   */
  getChainId() {
    return this._chainId;
  }

  /**
   * returns the sender's address
   * @return {Buffer}
   */
  getSenderAddress() {
    if (this._from) {
      return this._from;
    }
    const pubkey = this.getSenderPublicKey();
    this._from = ethUtil.publicToAddress(pubkey);
    return this._from;
  }

  /**
   * returns the public key of the sender
   * @return {Buffer}
   */
  getSenderPublicKey() {
    if (!this._senderPubKey || !this._senderPubKey.length) {
      if (!this.verifySignature()) throw new Error('Invalid Signature');
    }
    return this._senderPubKey;
  }

  /**
   * Determines if the signature is valid
   * @return {Boolean}
   */
  verifySignature() {
    const msgHash = this.hash(false);
    // All transaction signatures whose s-value is greater than secp256k1n/2 are considered invalid.
    if (this._homestead && new BN(this.s).cmp(N_DIV_2) === 1) {
      return false;
    }

    try {
      const v = ethUtil.bufferToInt(this.v);
      this._senderPubKey = ethUtil.ecrecover(msgHash, v, this.r, this.s);
    } catch (e) {
      return false;
    }

    return !!this._senderPubKey;
  }

  /**
   * sign a transaction with a given private key
   * @param {Buffer} privateKey
   */
  sign(privateKey) {
    const msgHash = this.hash(false);
    const sig = ethUtil.ecsign(msgHash, privateKey);
    Object.assign(this, sig);
  }

  /**
   * The amount of gas paid for the data in this tx
   * @return {BN}
   */
  getDataFee() {
    const data = this.raw[5];
    const cost = new BN(0);
    for (let i = 0; i < data.length; i++) {
      data[i] === 0
        ? cost.iaddn(fees.txDataZeroGas.v)
        : cost.iaddn(fees.txDataNonZeroGas.v);
    }
    return cost;
  }

  /**
   * the minimum amount of gas the tx must have (DataFee + TxFee + Creation Fee)
   * @return {BN}
   */
  getBaseFee() {
    const fee = this.getDataFee().iaddn(fees.txGas.v);
    if (this._homestead && this.toCreationAddress()) {
      fee.iaddn(fees.txCreation.v);
    }
    return fee;
  }

  /**
   * the up front amount that an account must have for this transaction to be valid
   * @return {BN}
   */
  getUpfrontCost() {
    return new BN(this.gasLimit)
      .imul(new BN(this.gasPrice))
      .iadd(new BN(this.value));
  }

  /**
   * validates the signature and checks to see if it has enough gas
   * @param {Boolean} [stringError=false] whether to return a string with a description of why the
   *   validation failed or return a Boolean
   * @return {Boolean|String}
   */
  validate(stringError) {
    const errors = [];
    if (!this.verifySignature()) {
      errors.push('Invalid Signature');
    }

    if (this.getBaseFee().cmp(new BN(this.gasLimit)) > 0) {
      errors.push([`gas limit is too low. Need at least ${this.getBaseFee()}`]);
    }

    if (stringError === undefined || stringError === false) {
      return errors.length === 0;
    }
    return errors.join(' ');
  }
}

module.exports = Transaction;
