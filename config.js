
// RPC:
exports.rpc = 'https://api.avax.network/ext/bc/C/rpc';

// Addresses:
exports.snob = '0xC38f41A296A4493Ff429F1238e030924A1542e50';
exports.xsnob = '0x83952E7ab4aca74ca96217D6F8f7591BEaD6D64E';
exports.gaugeProxy = '0x215D5eDEb6A6a3f84AE9d72962FEaCCdF815BF27';
exports.operations = '0x096a46142C199C940FfEBf34F0fe2F2d674fDB1F';
exports.treasury = '0x294aB3200ef36200db84C4128b7f1b4eec71E38a';
exports.devFund = '0x88aDa02f6fCE2F1A833cd9B4999D62a7ebb70367';

// API Keys:
exports.ckey = 'ckey_f49ab6dbd21f47a5a25eb922e0d';

// ABIs:
exports.minABI = [
  { constant: true, inputs: [{ name: "", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "uint256" }], type: "function" },
  { constant: true, inputs: [], name: "totalSupply", outputs: [{ name: "", type: "uint256" }], type: "function" }
];
exports.xsnobABI = [
  { constant: true, inputs: [{ name: "", type: "address" }], name: "locked", outputs: [{ name: "amount", type: "uint128" }, { name: "end", type: "uint256" }], type: "function" }
];