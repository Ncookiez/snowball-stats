
// RPC:
exports.rpc = 'https://api.avax.network/ext/bc/C/rpc';
exports.rpc_backup = 'https://avax-mainnet.gateway.pokt.network/v1/lb/605238bf6b986eea7cf36d5e/ext/bc/C/rpc';

// Snowball Variables:
exports.snob = '0xC38f41A296A4493Ff429F1238e030924A1542e50';
exports.xsnob = '0x83952E7ab4aca74ca96217D6F8f7591BEaD6D64E';
exports.gaugeProxy = '0x215D5eDEb6A6a3f84AE9d72962FEaCCdF815BF27';
exports.oldGaugeProxy = '0xFc371bA1E7874Ad893408D7B581F3c8471F03D2C';
exports.operations = '0x096a46142C199C940FfEBf34F0fe2F2d674fDB1F';
exports.council = '0x028933a66DD0cCC239a3d5c2243b2d96672f11F5';
exports.treasury = '0x294aB3200ef36200db84C4128b7f1b4eec71E38a';
exports.devFund = '0x88aDa02f6fCE2F1A833cd9B4999D62a7ebb70367';
exports.feeDistributor = '0xad86ef5fd2ebc25bb9db41a1fe8d0f2a322c7839';
exports.nfts = [
  { name: 'Early Voter', address: '0x7B097A18738cA9Fd524384Dab74c57CB12DAC724' },
  { name: 'India Covid Relief', address: '0xD928Ab4b54F7FD0498160Ee52AC0C92BbB9C9cb3' },
  { name: 'Snow Ball Head', address: '0x6a81866c94eFc097e75ABcbCddD3E8b63EbEBe93' },
  { name: 'Sherpa Climb', address: '0x89A3e2B87ea5fCa3a68eAD5643F040A0F636A46b' },
  { name: 'Rolling Sasquatch - Pink', address: '0x35F268DaC74f94785135aA134deDEf7e67Db8fe3' },
  { name: 'Rolling Sasquatch - Purple', address: '0xB954AE9a4374751CB3d578CfA3Db96e0E5881C00' },
  { name: 'Rolling Sasquatch - Orange', address: '0xD65e006644D417Af6A9385182C21733762b94E83' },
  { name: 'Rolling Sasquatch - Blue', address: '0xae88bE7d3fE6545C688b640B427aF4bAb90e2638' },
  { name: 'Rolling Sasquatch - Green', address: '0x5edd9bC699B6A613875E6760B4978d14d6EB3899' },
  { name: 'Rolling Sasquatch - Laser Eyes', address: '0xd66Df640A2f213B6e5087204cAee2b2145A1c1c9' },
  { name: 'Snowball Holiday Beanie', address: '0x9fF1918d212c435AD1F1734E9C4DC2DB835161Af' }
];
exports.nftMarketplaces = [
  '0xb61294df4cbf2a6af0c90d46e99bbdf4b750be3e',
  '0x14390f57ccfdb45f969381e7e107acf062d3a592',
  '0xd42e49c1b481817365b2fc744c9ae84ba3862429'
];
exports.platforms = ['Trader Joe', 'Banker Joe', 'Pangolin', 'Benqi', 'Aave', 'Axial', 'Teddy'];

// Axial Variables:
exports.axial = '0xcf8419a615c57511807236751c0af38db4ba3351';
exports.axialFeeDistributor = '0x084cfE7BA1C91d35Fec5015ca65E92Db41A3C9f7';
exports.axialTreasury = '0x4980AD7cCB304f7d3c5053Aa1131eD1EDaf48809';
exports.axialSymbols = ['AS4D', 'AC4D', 'AM3D', 'AA3D'];
exports.axialPools = [
  { name: 'AS4D', swap: '0x2a716c4933A20Cd8B9f9D9C39Ae7196A85c24228', tokens: [{ symbol: 'TUSD', decimals: 18 }, { symbol: 'USDC.e', decimals: 6 }, { symbol: 'DAI.e', decimals: 18 }, { symbol: 'USDT.e', decimals: 6 }] },
  { name: 'AC4D', swap: '0x8c3c1C6F971C01481150CA7942bD2bbB9Bc27bC7', tokens: [{ symbol: 'TSD', decimals: 18 }, { symbol: 'MIM', decimals: 18 }, { symbol: 'FRAX', decimals: 18 }, { symbol: 'DAI.e', decimals: 18 }] },
  { name: 'AM3D', swap: '0x90c7b96AD2142166D001B27b5fbc128494CDfBc8', tokens: [{ symbol: 'MIM', decimals: 18 }, { symbol: 'USDC.e', decimals: 6 }, { symbol: 'DAI.e', decimals: 18 }] },
  { name: 'AA3D', swap: '0x6EfbC734D91b229BE29137cf9fE531C1D3bf4Da6', tokens: [{ symbol: 'AVAI', decimals: 18 }, { symbol: 'MIM', decimals: 18 }, { symbol: 'USDC.e', decimals: 6 }] }
  // { name: 'USDC-AM3D', swap: '0x26694e4047eA77cC96341f0aC491773aC5469d72', tokens: [{ symbol: 'USDC', decimals: 6 }, { symbol: 'AM3D', decimals: 18 }] }
];
exports.paraswap = '0xdef171fe48cf0115b1d80b88dc8eab59176fee57';
exports.axialSwapEventABI = ['event TokenSwap(address indexed buyer, uint256 tokensSold, uint256 tokensBought, uint128 soldId, uint128 boughtId)'];
exports.axialTokens = [
  { symbol: 'TUSD', address: '0x1c20e891bab6b1727d14da358fae2984ed9b59eb', decimals: 18 },
  { symbol: 'USDC.e', address: '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664', decimals: 6 },
  { symbol: 'DAI.e', address: '0xd586e7f844cea2f87f50152665bcbc2c279d8d70', decimals: 18 },
  { symbol: 'USDT.e', address: '0xc7198437980c041c805a1edcba50c1ce5db95118', decimals: 6 },
  { symbol: 'TSD', address: '0x4fbf0429599460d327bd5f55625e30e4fc066095', decimals: 18 },
  { symbol: 'MIM', address: '0x130966628846bfd36ff31a822705796e8cb8c18d', decimals: 18 },
  { symbol: 'FRAX', address: '0xd24c2ad096400b6fbcd2ad8b24e7acbc21a1da64', decimals: 18 },
  { symbol: 'AVAI', address: '0x346a59146b9b4a77100d369a3d18e8007a9f46a6', decimals: 18 },
  { symbol: 'USDC', address: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', decimals: 6 }
];

// API Keys:
exports.ckey = 'ckey_f49ab6dbd21f47a5a25eb922e0d';

// Null Address:
exports.zero = '0x0000000000000000000000000000000000000000';

// Contract ABIs:
exports.minABI = [
  { constant: true, inputs: [{ name: "", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "uint256" }], type: "function" },
  { constant: true, inputs: [], name: "totalSupply", outputs: [{ name: "", type: "uint256" }], type: "function" },
  { constant: true, inputs: [], name: "symbol", outputs: [{ name: "", type: "string" }], type: "function" }
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
exports.snowGlobeABI = [
  { constant: true, inputs: [], name: "controller", outputs: [{ name: "", type: "address" }], type: "function" },
  { constant: true, inputs: [], name: "token", outputs: [{ name: "", type: "address" }], type: "function" }
];
exports.controllerABI = [
  { constant: true, inputs: [{ name: "<input>", type: "address" }], name: "strategies", outputs: [{ name: "", type: "address" }], type: "function" }
];
exports.lpTokenABI = [
  { constant: true, inputs: [], name: "token0", outputs: [{ name: "", type: "address" }], type: "function" },
  { constant: true, inputs: [], name: "token1", outputs: [{ name: "", type: "address" }], type: "function" }
];
exports.strategyABI = [
  { constant: true, inputs: [], name: "getName", outputs: [{ name: "", type: "string" }], type: "function" }
]
exports.swapABI = [
  { constant: true, inputs: [{ name: "index", type: "uint256" }], name: "getAdminBalance", outputs: [{ name: "", type: "uint256" }], type: "function" }
];