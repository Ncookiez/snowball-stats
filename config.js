
// RPCs:
exports.rpc = 'https://api.avax.network/ext/bc/C/rpc';
exports.rpc_backup = 'https://avax-mainnet.gateway.pokt.network/v1/lb/605238bf6b986eea7cf36d5e/ext/bc/C/rpc';

// Other Initializations:
exports.ckey = 'ckey_f49ab6dbd21f47a5a25eb922e0d';
exports.zero = '0x0000000000000000000000000000000000000000';

/* ====================================================================================================================================================== */

// Snowball Variables:
exports.snob = '0xC38f41A296A4493Ff429F1238e030924A1542e50';
exports.xsnob = '0x83952E7ab4aca74ca96217D6F8f7591BEaD6D64E';
exports.governance = '0xfdCcf6D49A29f435E509DFFAAFDecB0ADD93f8C0';
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
exports.platforms = ['Optimized', 'Trader Joe', 'Banker Joe', 'Pangolin', 'Benqi', 'Aave', 'Axial', 'Teddy', 'Platypus'];
exports.optimizedPoolController = '0x2f0b4e7ac032d0708c082994fb21dd75db514744';
exports.optimizedPoolStrategies = {
  'DAI.e': [
    { platform: 'Aave', address: '0x13d753C651526Bf3501818813B829B339ae867AF' },
    { platform: 'BenQi', address: '0x5618041c863228DC6298bc5fD17EADa6Fe9Df618' }
  ],
  'LINK.e': [
    { platform: 'BenQi', address: '0xEbbDEC4bFDd23eCC53225214Faf4612c19Dd0347' },
    { platform: 'Banker Joe', address: '0x702490d609BcaAf697f345D502b15F7c60F35856' }
  ],
  'USDC.e': [
    { platform: 'Aave', address: '0x707090bbCfd3b4470C724aF560FE3d7D7d0590E2' },
    { platform: 'BenQi', address: '0xE8c651B51460248457b80DFDEE0E545Bd474bd68' },
    { platform: 'Banker Joe', address: '0x80e47C48e9375c6431bE3FCB7DCd30dcc2bb5A3b' }
  ],
  'USDT.e': [
    { platform: 'Aave', address: '0x5e8B060639646117539Fd33Ee221364012332C9B' },
    { platform: 'BenQi', address: '0xcCb342985a2963Cd3643cfb40b63D145Ec8C5A40' },
    { platform: 'Banker Joe', address: '0x1A07f2AEec34E3CaDaf85EeEE45fcC70881178DF' }
  ],
  'WAVAX': [
    { platform: 'Aave', address: '0x0f776b5b97BfA366f929FE82bd50C312C39f26f1' },
    { platform: 'BenQi', address: '0x48f736cC619cAd053F559cF24edfa2401BeD9c76' },
    { platform: 'Banker Joe', address: '0x5bd7bB54e3B6798Ca33AcbD1F26541053721e69f' }
  ],
  'WBTC.e': [
    { platform: 'Aave', address: '0xC623a46Ebd2398db4188070Efde2f355F5832399' },
    { platform: 'BenQi', address: '0x35C340bFFB89e00734e13b245EA2B80570D528b1' },
    { platform: 'Banker Joe', address: '0x9DcB28e8c2dB31b44Ce0448d567f48E8a310E808' }
  ],
  'WETH.e': [
    { platform: 'Aave', address: '0xBe290f7E69d5eC6941F9A3d6F1ebF93C179AD6DE' },
    { platform: 'BenQi', address: '0x730ad83E992aE5A328a5ccEeEF26B0e821ACB524' },
    { platform: 'Banker Joe', address: '0xfd2400B36a20a07c4ca79DfbEf4045Ea249B2a45' }
  ]
}

/* ====================================================================================================================================================== */

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
];
exports.paraswap = '0xdef171fe48cf0115b1d80b88dc8eab59176fee57';
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
exports.axialDistributions = [ // https://api.snowtrace.io/api?module=block&action=getblocknobytime&closest=before&timestamp=<TIMESTAMP>
  { block: 6786231, timestamp: 1636588800 },  // Nov. 11, 2021
  { block: 7085471, timestamp: 1637193600 },  // Nov. 18, 2021
  { block: 7386860, timestamp: 1637798400 },  // Nov. 25, 2021
  { block: 7687393, timestamp: 1638403200 },  // Dec.  2, 2021
  { block: 7989367, timestamp: 1639008000 },  // Dec.  9, 2021
  { block: 8290862, timestamp: 1639612800 },  // Dec. 16, 2021
  { block: 8589431, timestamp: 1640217600 },  // Dec. 23, 2021
  { block: 8888076, timestamp: 1640822400 },  // Dec. 30, 2021
  { block: 9187865, timestamp: 1641427200 },  // Jan.  6, 2022
  { block: 9491470, timestamp: 1642032000 },  // Jan. 13, 2022
  { block: 9797372, timestamp: 1642636800 },  // Jan. 20, 2022
  { block: 10101236, timestamp: 1643241600 }, // Jan. 27, 2022
  { block: 10407972, timestamp: 1643846400 }, // Feb.  3, 2022
  { block: 10714104, timestamp: 1644451200 }, // Feb. 10, 2022
];

/* ====================================================================================================================================================== */

// Teddy Variables:
exports.teddy = '0x094bd7b2d99711a1486fb94d4395801c6d0fddcc';
exports.tsd = '0x4fbf0429599460D327BD5F55625E30E4fC066095';
exports.teddyStaking = '0xb4387D93B5A9392f64963cd44389e7D9D2E1053c';
exports.stabilityPool = '0x7AEd63385C03Dc8ed2133F705bbB63E8EA607522';
exports.teddyIssuance = '0xb4Fbc7839ce88029c8c1c6274660118e27B6f982';
exports.troves = '0xd22b04395705144Fd12AfFD854248427A2776194';
exports.sortedTroves = '0x5272DfB4851723328dA7730BE944502E5C965f40';
exports.teddyTreasury = '0x7B4a14CD122BFE2e717c27914a024D05eC3061B9';
exports.teddyDevFund = '0x41f8a18b165De90383bf23CbcE5c0244ECDeeaA7';

/* ====================================================================================================================================================== */

// Event ABIs:
exports.transferEventABI = ['event Transfer(address indexed from, address indexed to, uint256 value)'];
exports.voteEventABI = ['event NewVote(uint256 proposalId, address voter, bool support, uint256 votes)'];
exports.axialSwapEventABI = ['event TokenSwap(address indexed buyer, uint256 tokensSold, uint256 tokensBought, uint128 soldId, uint128 boughtId)'];

// Contract ABIs:
exports.minABI = [
  { constant: true, inputs: [{ name: "", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "uint256" }], type: "function" },
  { constant: true, inputs: [], name: "totalSupply", outputs: [{ name: "", type: "uint256" }], type: "function" },
  { constant: true, inputs: [], name: "symbol", outputs: [{ name: "", type: "string" }], type: "function" }
];
exports.xsnobABI = [
  { constant: true, inputs: [{ name: "", type: "address" }], name: "locked", outputs: [{ name: "amount", type: "uint128" }, { name: "end", type: "uint256" }], type: "function" }
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
exports.governanceABI = [
  { constant: true, inputs: [{ name: "<input>", type: "uint256" }], name: "proposals", outputs: [{ name: "title", type: "string" }, { name: "metadata", type: "string" }, { name: "proposer", type: "address" }, { name: "executor", type: "address" }, { name: "startTime", type: "uint256" }, { name: "votingPeriod", type: "uint256" }, { name: "quorumVotes", type: "uint256" }, { name: "executionDelay", type: "uint256" }, { name: "forVotes", type: "uint256" }, { name: "againstVotes", type: "uint256" }], type: "function" }
];
exports.troveManagerABI = [
  { constant: true, inputs: [], name: "getEntireSystemColl", outputs: [{ name: "", type: "uint256" }], type: "function" },
  { constant: true, inputs: [{ name: "<input>", type: "uint256" }], name: "TroveOwners", outputs: [{ name: "", type: "address" }], type: "function" },
  { constant: true, inputs: [{ name: "<input>", type: "address" }], name: "Troves", outputs: [{ name: "debt", type: "uint256" }, { name: "coll", type: "uint256" }, { name: "stake", type: "uint256" }, { name: "status", type: "uint8" }, { name: "arrayIndex", type: "uint128" }], type: "function" }
];
exports.sortedTrovesABI = [
  { constant: true, inputs: [], name: "getSize", outputs: [{ name: "", type: "uint256" }], type: "function" }
];

/* ====================================================================================================================================================== */

// Deprecated Snowball Contracts:
exports.deprecatedGlobes = [
  '0xAbD637a6881a2D4bbf279aE484c2447c070f7C73',
  '0xB305856C54efC004955BC51e3D20ceF566C11eEE',
  '0xAD050d11521dd1dD2Cc136A9e979BAA8F6Fab69a',
  '0x4bD6D4fE5E3bBaa0FfB075EE9F0980FbcC6c0192',
  '0x86b109380aB2c34B740848b06Bee62C882F01df5',
  '0x2f17BAC3E0339C1BFB6E0DD380d65bd2Fc665C75',
  '0x29BF8c19e044732b110faA1Ff0Cc59CA35c13f17',
  '0xcEBFFa4C80291e80EA0684E4C8884124d6a81197',
  '0xb357bA896818ccCd020fb3781a443E3d3f93beFf',
  '0x962ECf51A169090002CC88B4Bf16e447d2E13100',
  '0x6440365E1c9282F50477b1F00289b3A7218E47Ef',
  '0xBfB27f6F03312D0828045faC1a8d6F0bF6E5C97c',
  '0xE6AEd4920517eBd338aCba2fCb15c4FEF2B04032',
  '0x5c57cDc3FE879411df390AaC56AE853aE0EBe131',
  '0xbBA0f8A3Aa16657D1df2A6E87A73ee74Fec42711',
  '0xb81159B533F517f0E36978b7b8e9E8409fb9C169',
  '0x810CF29576E61695BA7Fe1e4D493663185691854',
  '0xb58fA0e89b5a32E3bEeCf6B16704cabF8471F0E1',
  '0xB4Fe95e89ED8894790aA6164f29FaC4B0De94f47',
  '0x3A4b529d887E0d5672dEd31CE0d7a5202FDb43b2',
  '0x6C915564607d62B007D203c04473152bc090EE93',
  '0xfe19f34873fC2C7ddcB8e392791b97526B4d22e0',
  '0xd596136ee746BaeE7ac159B3c21E71b3aeb81A68',
  '0x6a52e6b23700A63eA4a0Db313eBD386Fb510eE3C',
  '0x586554828eE99811A8ef75029351179949762c26',
  '0x00933c16e06b1d15958317C2793BC54394Ae356C',
  '0x751089F1bf31B13Fa0F0537ae78108088a2253BF',
  '0x39BE35904f52E83137881C0AC71501Edf0180181',
  '0x3fcFBCB4b368222fCB4d9c314eCA597489FE8605',
  '0xb21b21E4fA802EE4c158d7cf4bD5416B8035c5e0',
  '0xdf7F15d05d641dF701D961a38d03028e0a26a42D',
  '0xD0686AC7d0CfFd00A29567D37774058452210D57',
  '0x07E837D2ae3F2fB565ABdAa80797d47412FC3a94',
  '0x888Ab4CB2279bDB1A81c49451581d7c243AffbEf',
  '0x39BF214A93EC72e42bC0B9b8C07BE1af6Fe169dA',
  '0x5B8eE2c0a4f249e16f26d31636F1ed79df5405f9',
  '0xEb1010B9CF8484fcA2650525d477DD002fa889cE',
  '0x5cce813cd2bBbA5aEe6fddfFAde1D3976150b860',
  '0x2ad520b64e6058654FE6E67bc790221772b63ecE',
  '0xf2596c84aCf1c7350dCF6941604DEd359dD506DB',
  '0x7F8E7a8Bd63A113B202AE905877918Fb9cA13091',
  '0x3F2b777d055dbD4D0812f3750Ee71190431D3Fc8',
  '0xa3528E975ed30326e4930c8F70b01F9d9608D8b1',
  '0x096bAE6C45b0047eF3F1cf1f1c8a56eF0cd58cdE',
  '0x342476c1F9436277acBC088788D0De53b8b34106',
  '0x2F2Ba207f86b46b05a1c79e50b9f980e267719B8',
  '0xD579719d3a58492D803c7d60E3565733a4ba3DEa',
  '0x973509A4e6DfAA2B5753fC8FB4f85F861fFbA8BB',
  '0x7Fc1954FbC383e5c477b81c0E1CFBf3846D0dE10',
  '0x05Bba89E406792D2d73d6D4022347c3893b02a20',
  '0xee4F816ac2333A346B7B3a76579F0b5342511822',
  '0x86C70CE247Cd76b776748687634382a1830b3aC4',
  '0x42c3Fa6514Ac55F0f2CA4E910D897282829c0Ab2',
  '0xc88477DD929837B0e6Aeafeb9Dd2Dd238505E698',
  '0x4c885E844283D9FAf10607106963768113342543',
  '0xEf28DbfDB08c4475f5fA07Ac2aD4B8C1cFE2938a',
  '0x07e7dF7F0612B7dc6789ba402b17c7108c932d05',
  '0x492e7FcBD4e69D2A0f7f83aA2cA0397dE49362f2',
  '0x44F8c64856ea948D502DBEE084d3D6293fA291c8',
  '0xAf931ded9dBb9D8f84baE9748E71485C45dd69C5',
  '0x4E9f0B7fa23e9197ca41AFB0E15C3175EDE57456',
  '0x52A27EbAb7266dac986B66e39f39E73C86e85514',
  '0xd686aD524e3324F20eafBAf0e80f4553f749431d',
  '0xeEc0b6B6Af1a5Ec3571Ca5E219511bbd630F0477',
  '0x53A646A61038F05e7E4584B367FDfabcF62e0844',
  '0xCb99CFaF774eec0F4600B610Bc429204a8b9DddE',
  '0x28a5e50d0841d7AC5d858A76a1C54f27baB6Eda9',
  '0xc8AA857291B6622A212D4C32eecCcFBd6D06E685',
  '0x42E1CDd48884C9027E965600B4A725a91D27255b',
  '0xFe128e46E6C450662d4Dcf361e740e787cDBce50',
  '0xD4ADAD0cA62bC5B504DcF302c85E649E6175424f',
  '0x322094FDB02677E7a993E735826c9E183fc605a6',
  '0xe720fca4cfF42F03eC01A12F23592b731A43EDCf',
  '0x192ae260676Ba79ccc57A6f4Ed692Bfe371658b9',
  '0x27f8FE86a513bAAF18B59D3dD15218Cc629640Fc',
  '0xfe1A87Cc4a2144f7eBb7d731bE80bF0e4CC6E909',
  '0xB4db531076494432eaAA4C6fCD59fcc876af2734',
  '0x8309C64390F376fD778BDd701d54d1F8DFfe1F39',
  '0xa39785a4E4CdDa7509751ed152a00f3D37FbFa9F',
  '0x585DE92A24057400a7c445c89338c7d6c61dd080',
  '0xF23c55a05C9f24177FFF5934e8192461AeE4f304',
  '0xf5b4Ba166b8b351C0dF92BdD6bf7d46d537185fB',
  '0xd7E8d994e0ac76a8c41496290A11CA212F074851',
  '0x9EC50ee696bB1c6f8f4e2181f61ad687700005cF',
  '0x894E10EAf14Cc5a7fca4670039114139cd5aeabE',
  '0x0c33Aa168E0882Bf0B3e4AFfBf139F44d3aC8d7f',
  '0xb3DbF3ff266a604A66dbc1783257377239792828',
  '0x45981aB8cE749466c1d2022F50e24AbBEE71d15A',
  '0x384bcAEA70Ae79823312327a52e498E55c6730dA',
  '0x92f75Da67c5E647D86A56a5a3D6C9a25e887504A',
  '0x857f9A61C97d175EaE9E0A8bb74CF701d45a18dc',
  '0xEC7dA05C3FA5612f708378025fe1C0e1904aFbb5',
  '0xBc00e639a4795D7DfB43179866acB45eE5169fAE',
  '0x351BA4c9b0F09aA76a8Aba8b1cF924aE98beb790',
  '0x2070Bf205a649dE46F92c4f187Ae941a13688850',
  '0x432be17144cc16b1FEfc58952467e7539073519A',
  '0x7F68E4635b4Ee504028D4b54d07681861d063e48',
  '0xD20C684298Da144289776224e5c19D7FeEA6152a',
  '0xEC908EA85e321fD3c9675F6d1Be41183aaf3C3E3',
  '0x51B03A4A57da8ea9FC4549d1C54f6ccd678e2892',
  '0x2B30b282405C3ee946843901dDbEc1a82562a1fC',
  '0x3815f36C3d60d658797958EAD8778f6500be16Df',
  '0x763Aa38c837f61DD8429313933Cc47f24E881430',
  '0x392c51Ab0AF3017E3e22713353eCF5B9d6fBDE84',
  '0x7987aDB3C789f071FeFC1BEb15Ce6DfDfbc75899',
  '0x8eDd233546730C51a9d3840e954E5581Eb3fDAB1',
  '0xcD651AD29835099334d312a9372418Eb2b70c72F',
  '0x3270b685A4a61252C6f30c1eBca9DbE622984e22',
  '0x14F98349Af847AB472Eb7f7c705Dc4Bee530713B',
  '0x234ed7c95Be12b2A0A43fF602e737225C83c2aa1',
  '0x9397A0257631955DBee5404506B363ab276D2315',
  '0x8406aAF035c2c50239b32D1cb4583916c1F1c094',
  '0x1812f42de15EA7da3901ce34237Ee8CA5F01857a',
  '0x32930cFE5B9C5C5d247e36C31837562fDCD68553',
  '0xA888388f6f54e25e59A99498731e71CA10aAF77a',
  '0x7b74324f523831687fC8FCE946F15a3AA632dC06',
  '0x68b8037876385BBd6bBe80bAbB2511b95DA372C4'
];
exports.deprecatedGauges = [
  '0xa634ec1bada2fac4eaa71439b0b18dd3486823e6',
  '0x5e8fe0f937c4b842b4c48542fbb33e4830a14048',
  '0x72473eb3f0e26c0dcf8332b5af129fa4f62c1046',
  '0xb1755d58c6519a7ccb52206b4dfe64fe591574e6',
  '0x67160690c546925e03fe4191bc28cd70b459cc82',
  '0x76ac2c3d79ee189487b3eaf7cb4299e413af3e66',
  '0x298127A0F46A0538bFf45d0be1b6030c8662C4DB',
  '0x0e1c4755c23387D0082427DE902B02DA7Dcb1dC7',
  '0xe820acC10C6208769a78887fa6D5631e67b54057',
  '0x7ce21da8bdec164610a4e8252ac3cd9d60903474',
  '0xc1f70c937ea06b862457ab2ce2d0913dffd4ae0a',
  '0x0260d6F8B4F1832c0819466e0E672862c583c4Fd',
  '0x81eFD4f7c7cccDbb50E2DB09c11130804d781DbA',
  '0x781e84eF95899417CDd2aD6BB8a7ab30cc51BE36',
  '0x8555681BA3f8a53b2FE3f2BA8F0Bd45D7b0be35B',
  '0xc99dc5Fc08e77e6b4903fdcF135A6919890476D5',
  '0x3af37b647a08d443ef08aff8cddeae33bba56779',
  '0xAF72B2f70e2b572094A55566900BC6775b78F018',
  '0x83C06140FE1769405CC98f81A75fe6E177B4B333',
  '0x34a7D5c000fC8f668C5e3cfeCb7bCb0Cc74aCD5A',
  '0x063da670647fcE8aF1c2fDe692a414e2f956db88',
  '0x3dE0328e26D66163B72f0497a0b65e8A7cD3ea46',
  '0xBdcAeC02E470C23DCd60F0972Ca8dD238E5382ca',
  '0x926333ee90C2E6b9d56645866F855B19ff4f258e',
  '0x75d429de70Ff78B817dfF6B7Ce8C99Fd766A3782',
  '0xcacf38d95bc613cb3f5f2306b6fbed2472fd5ae6',
  '0xff49e162e6bc10cdf12a8c35f162b79ab3d34bea',
  '0x32553a13b6d3521845861ff1aff6f511b109374b',
  '0x1369e19dbd4825616df7ade73ea92aa7504d851e',
  '0x29CD11ddC2C42c726F1C1EDD2cF1c15d16412E0f',
  '0xB347a857F20857c954b7aF52D9A306dF2F9EC89f',
  '0x6bb9d2420217e0c3f272f47c58942e89e23806c9',
  '0x7e68717f6228764bc1fc7a970dd5a041837c370c',
  '0x38a9635c0a1b62a7d8bc608a3ad5d84b300831ae',
  '0x4906bf6aa9aad2b76f2c92738b7242a5c7a6a7bd',
  '0x45590658f6608c5be4c94ce885c52dbddb4fa21a',
  '0x2e2191fde0872e686b0a5117cd639896d2c8ad97',
  '0x0e06c4d0ecaae66b82ebc9133ca52ea82702cd30',
  '0x54DD846ec886449Baf4D19A844B1F5C597Acb48B',
  '0x22b7e7694739Ee6fb5Fd05b8A1c601C6C568F99A',
  '0x531d455181b952b467e3e9228bfa2cc45ba2366e',
  '0x25384dbc68e6dcd7a6b1769dba5622f1307f1b18',
  '0x2b1119bf0c536acc96761ab8b26e0e38294ea20e',
  '0x948ca505486fbe0537bb17923dac6d8059a35931',
  '0x579b8a48f3fae8738ee12e8dafe876f19c86d642',
  '0xd442e86df4aed7ed4b3bac67276d30ca89a15336',
  '0x066def2b8c7258352f1295ef9ad473ed9ddf409b',
  '0xdf4dfdd445092f996430cd4e4783b471eb3e5c81',
  '0xd327e3e439719cc3dd5f6181e3f99ef11a59c876',
  '0xd3dc0f360a0bf62939af7cd266b56c63762b100d',
  '0x3dcad10c73dff08a708a8e3a8c21e6a07844f10e',
  '0xd3ff20d6ae096f7f409ccb0648bef04387166ed5',
  '0x94ee0d35cf0f6fbbad224d9757fc2a87ea643ca4',
  '0xcb88f7e2092335ca45439c2d806767c08dba9b99',
  '0x1e6063cff3fb325d08c80048ee8c168a8799010a',
  '0xac2f4a0c972e8e4ddc5b3455620c76116c90e0c2',
  '0x814320bdc7ec20cc33fed8e875653189da16392e',
  '0xc485b222596f211529db7c9cf415db7d1cb3e12c',
  '0x2C7C8ffBa3348EEFc83143043fa9733Eb9F4fAf6',
  '0x83866b7817Ab99451F773193d307D9E7FE4D191d',
  '0x9a18562ff2F2fb097a979d97b49F6Bc2eFf0A776',
  '0x06e2E0b3c8140C46c59Cf1BDEA33d5472C2888ff',
  '0xEAF0564a31E9dCa66D22d72778d6C751E86187B3',
  '0x84dd0375D8ae5AfBE943811eAC366Fe4A51e5CfE',
  '0x0126A8d522D1b6e6EB2b89403d426ec9c6FA6c51',
  '0x09D20b31Fa96233762aB7091A6Ac7e65C08DBA88',
  '0x2846B650618044d736eCaD75C8B4949F821F6571',
  '0xdDe98d5057C6059A6935535404314808D7605b3d',
  '0x10bf69786b9962bF6fb569827a42639894AED37A',
  '0x22b19fD5aC461573a41e738B05FEd4bcA681A3da',
  '0xFecac8049f15F731a069654B7b84d74D5CB50308',
  '0x5759192eccF9DdF64dE878fEd41A21A6aE37974c',
  '0xb211a55E9E9ae461cf96857616265bf8142Bef19',
  '0x3F94Af99e61524FCE83bb7F99AA041B917592a9a',
  '0x13B0E3656e42f7ebb295BaCaaEc46d21AC1d7e4f',
  '0x300cB5a123847B597d9d6D8cd7305006382BfCD2',
  '0x5f09Ff88F8E7A85B8d614B54785146d10552C534',
  '0x0202Bc153066c9524e5cD13f5d828356391941D0',
  '0xC2a09e4753bB62eF8e18b86aA1D4D8Ba40DAb14A',
  '0x90c7adcfd0c6dfeb19ca7a5fc1d8c76dee55d4ee',
  '0x36f6702dA28424aBdFDf55827DC598ab6A064Bcd',
  '0x7325E1597D48dc43aD9eaA5Dfd64Ecc14cAAF976',
  '0xb7459a44f330392f0E57554266F6333150B33d13',
  '0x2a83cf1cc8727d281c1afa9385d5e7f75b2fafb5',
  '0x97150ce64e4f569b0ad63a85e564391bbddc2a22',
  '0x53f7445190f2010f8d22ea6e220813d4254b153f',
  '0xb9e680e2af5f132d8ad6187d8a1ed1d99dea2772',
  '0x2ab1ecacf7f641f3d2ed924b513086b64ae0f4ea',
  '0x44a67a7befefe04eb483fe421d9548d3c568e729',
  '0x73d7b65abaaa2f5afcdab4f658d668bf4094900a',
  '0x195f14ce502db7678b0a6ff961163d5dd9d6490d',
  '0x852e476e864794ec426c4f039785694680f15edd',
  '0xcc34d1bf84e30a37a02e4ba09b01e2d8b58c1b00',
  '0x1780931c983892d413b81d4ba973f7115a7d7d02',
  '0xc083a1a253d03fea95ee8ddcc33381a15c57fb5c',
  '0x3eb5d92b29b995074bf30f8660b75ef348c7775a',
  '0xa6a7d3b98b4b3bbb0ffc8a592b92f7f9b25b885a',
  '0xdc3d275457c86ddeb23bc209d9b68d92024b685c',
  '0xef9c3d66d97c222f5aa8e71e1a950827297b95bf',
  '0xbc8b490172be58552d2661f45ed4e122bda12831',
  '0x360fb158d20a43aa1b9562b7946cb2751e636053',
  '0x8db4eb81c1faf39d1e47508edef9ac29c13cff26',
  '0x26e33a0cb247d66bb5aefc4ca143dd2722642f3c',
  '0x1a300eb0da88f1f9ece264f0d0676386ba9aa776',
  '0x99571b620fe253fb3888062c0ce0496e1a92ab61',
  '0xadcc2b5c41b62e545bc296078444ae040ecd7d3d',
  '0x0f69c82c2d97b828c5ff37890207e87d08c09673',
  '0xfd56d870d8c8280be0542b0151112f4f95a0a70b',
  '0x5f05dc58ee067c91a98ec025d5c332af40b84667',
  '0x1e544e0eedc7e44f506f2ae7d389e0b07289e3c1',
  '0xc4960af75f321c7fb36b725afc6059727e2db457',
  '0xe58961d4895f0e26309ca1f36d607c6a2a1556ff',
  '0xaf309db1bed322880a1edb8da426450e1c3be98e',
  '0xad3c7787ac474130c771676794fdede41e3a7f98',
  '0xef36cce5017471189030c84a218a6c60502d2248',
  '0xf0c180fcbd9fafd541e8be1303cf8c72eda80399',
  '0xbcbce1fb679b9eba3c2e266232c86e06ab2e1e45',
  '0x019c497191f8cd3c9579eb8b79db1b58a76d8314',
  '0xbf23aafa5ba0bc81f798f190b1b632ecf3fd4709',
  '0x325136eb3d3095f56af02f421c2a0dd29e97046c',
  '0x5b0cd80fbad887a575bf309df11e1c2463215ecd',
  '0xc2bdf4a26a2871043749491b6835a3cb7ace91ef',
  '0x94b8eda49fd68db7031bea62b2fab029d5dbc075',
  '0x147df495aadbf44ae9aa31ad1b75f9ccbfc753df',
  '0xb5f62f8a5ded277c6b67f6179c6ea6b6e30f4644',
  '0x21791d9812d068a993b29fba74f734e785e4838f',
  '0x30971be910dc84f9621ff110bb2e09c761859253',
  '0xeb1e15bdc4339a3e5a4a6ab4a87e719022990716',
  '0xe00d6d4158e5a2946ee3178eb3651d43196b12e8',
  '0xfd72d186ba9ac0f5f79f4370ba584b8bda2ae4dd',
  '0xe52fd0cbc3e84520c39a383ee6df3c1a1776d5d8',
  '0x15a6d23d2bf3a2aca33aadc2e1f597929d6d61c8',
  '0xdBc58A1150b837FB1aA73981988dE90e1C238Dbf',
  '0x2194B40bF9F7d3429E30fC7451cf422c1B3cdcC0',
  '0xaBe28c3B53E8200C87aDb2b790d3594C3fcEf16d',
  '0x0Ec726BF3FF6CBf58c9f300d86F5fAd149a52039'
];