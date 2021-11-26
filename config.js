
// RPC:
exports.rpc = 'https://api.avax.network/ext/bc/C/rpc';
exports.rpc_backup = 'https://avax-mainnet.gateway.pokt.network/v1/lb/605238bf6b986eea7cf36d5e/ext/bc/C/rpc';

// Addresses:
exports.snob = '0xC38f41A296A4493Ff429F1238e030924A1542e50';
exports.xsnob = '0x83952E7ab4aca74ca96217D6F8f7591BEaD6D64E';
exports.gaugeProxy = '0x215D5eDEb6A6a3f84AE9d72962FEaCCdF815BF27';
exports.oldGaugeProxy = '0xFc371bA1E7874Ad893408D7B581F3c8471F03D2C';
exports.operations = '0x096a46142C199C940FfEBf34F0fe2F2d674fDB1F';
exports.treasury = '0x294aB3200ef36200db84C4128b7f1b4eec71E38a';
exports.devFund = '0x88aDa02f6fCE2F1A833cd9B4999D62a7ebb70367';
exports.feeDistributor = '0xad86ef5fd2ebc25bb9db41a1fe8d0f2a322c7839';
exports.axial = '0xcf8419a615c57511807236751c0af38db4ba3351';
exports.axialFeeDistributor = '0x084cfE7BA1C91d35Fec5015ca65E92Db41A3C9f7';
exports.axialTreasury = '0x4980AD7cCB304f7d3c5053Aa1131eD1EDaf48809';

// API Keys:
exports.ckey = 'ckey_f49ab6dbd21f47a5a25eb922e0d';

// ABIs:
exports.minABI = [
  { constant: true, inputs: [{ name: "", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "uint256" }], type: "function" },
  { constant: true, inputs: [], name: "totalSupply", outputs: [{ name: "", type: "uint256" }], type: "function" }
];
exports.xsnobABI = [
  { constant: true, inputs: [{ name: "", type: "address" }], name: "locked", outputs: [{ name: "amount", type: "uint128" }, { name: "end", type: "uint256" }], type: "function" },
  { constant: true, inputs: [], name: "totalSupply", outputs: [{ name: "", type: "uint256" }], type: "function" }
];
exports.gaugeProxyABI = [
  { constant: true, inputs: [], name: "tokens", outputs: [{ name: "", type: "address[]" }], type: "function" },
  { constant: true, inputs: [{ name: "", type: "address" }], name: "getGauge", outputs: [{ name: "", type: "address" }], type: "function" }
];
exports.feeDistributorABI = [
  { constant: true, inputs: [], name: "start_time", outputs: [{ name: "", type: "uint256" }], type: "function" },
  { constant: true, inputs: [{ name: "arg0", type: "uint256" }], name: "tokens_per_week", outputs: [{ name: "", type: "uint256" }], type: "function" },
  { constant: true, inputs: [{ name: "arg0", type: "uint256" }], name: "ve_supply", outputs: [{ name: "", type: "uint256" }], type: "function" }
];