
// Required Packages:
const { ethers } = require('ethers');
const fs = require('fs');

// Required Config Variables:
const config = require('./config.js');

// Setting Up RPCs:
const avax = new ethers.providers.JsonRpcProvider(config.rpc);
const avax_backup = new ethers.providers.JsonRpcProvider(config.rpc_backup);

// Setting Up Ignore Addresses:
const ignoreAddresses = [
  '0xb91124ecef333f17354add2a8b944c76979fe3ec', // StableVault
  '0x53b37b9a6631c462d74d65d61e1c056ea9daa637'  // Weird PNG-ETH LP Token
];

// Setting Up Single-Asset Trader Joe Strategies:
const singleTraderJoeStrats = [
  '0x6a52e6b23700a63ea4a0db313ebd386fb510ee3c'  // xJOE
];

// Additional Settings:
const lpSymbols = ['PGL', 'JLP'];
const batchSize = 10;
let progress = 0;
let maxProgress = 0;

/* ====================================================================================================================================================== */

// Function to make blockchain queries:
const query = async (address, abi, method, args) => {
  let result;
  let errors = 0;
  while(!result) {
    try {
      let contract = new ethers.Contract(address, abi, avax);
      result = await contract[method](...args);
    } catch {
      try {
        let contract = new ethers.Contract(address, abi, avax_backup);
        result = await contract[method](...args);
      } catch {
        if(++errors === 5) {
          console.error(`\n  > Error calling ${method}(${args}) on ${address}`);
          console.warn(`  > Execution was stopped due to errors. Try again or check script.`);
          process.exit(1);
        }
      }
    }
  }
  return result;
}

/* ====================================================================================================================================================== */

// Function to communicate script progress to user:
const updateProgress = () => {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  if(++progress < maxProgress) {
    process.stdout.write(`  > Pools Loaded: ${progress}/${maxProgress}`);
  } else {
    process.stdout.write(`  > All ${maxProgress} Pools Loaded.\n`);
  }
}

/* ====================================================================================================================================================== */

// Function to fetch all SnowGlobe addresses:
const fetchGlobes = async () => {
  let globes = await query(config.gaugeProxy, config.gaugeProxyABI, 'tokens', []);
  return globes;
}

/* ====================================================================================================================================================== */

// Function to fetch gauge address for a SnowGlobe:
const fetchGauge = async (globe) => {
  let strategy = await query(config.gaugeProxy, config.gaugeProxyABI, 'getGauge', [globe]);
  return strategy;
}

/* ====================================================================================================================================================== */

// Function to fetch controller address for a SnowGlobe:
const fetchController = async (globe) => {
  let controller = await query(globe, config.snowGlobeABI, 'controller', []);
  return controller;
}

/* ====================================================================================================================================================== */

// Function to fetch token address and symbol for a SnowGlobe:
const fetchToken = async (globe) => {
  let address = await query(globe, config.snowGlobeABI, 'token', []);
  let symbol = await query(address, config.minABI, 'symbol', []);
  return {symbol, address};
}

/* ====================================================================================================================================================== */

// Function to fetch strategy address for a SnowGlobe:
const fetchStrategy = async (controller, address) => {
  let strategy = await query(controller, config.controllerABI, 'strategies', [address]);
  return strategy;
}

/* ====================================================================================================================================================== */

// Function to fetch underlying token symbols and addresses for a SnowGlobe:
const fetchUnderlyingTokens = async (address) => {
  let token0 = await query(address, config.lpTokenABI, 'token0', []);
  let token1 = await query(address, config.lpTokenABI, 'token1', []);
  let symbol0 = await query(token0, config.minABI, 'symbol', []);
  let symbol1 = await query(token1, config.minABI, 'symbol', []);
  return {token0: {symbol: symbol0, address: token0}, token1: {symbol: symbol1, address: token1}};
}

/* ====================================================================================================================================================== */

// Function to fetch pool platform:
const fetchPlatform = async (token, strategy, globe) => {
  let platform = null;
  if(token.symbol === 'PGL') {
    platform = 'Pangolin';
  } else if(token.symbol === 'JLP' || singleTraderJoeStrats.includes(globe.toLowerCase())) {
    platform = 'Trader Joe';
  } else if(config.axialSymbols.includes(token.symbol)) {
    platform = 'Axial';
  } else {
    let name = (await query(strategy, config.strategyABI, 'getName', [])).slice(8);
    if(name.startsWith('Benqi')) {
      platform = 'Benqi';
    } else if(name.startsWith('Teddy')) {
      platform = 'Teddy';
    } else if(name.startsWith('Aave')) {
      platform = 'Aave';
    } else if(name.startsWith('Png')) {
      platform = 'Pangolin';
    } else if(name.startsWith('Joe')) {
      platform = 'Banker Joe';
    }
  }
  return platform;
}

/* ====================================================================================================================================================== */

// Function to fetch batch of data:
const fetchBatch = async (globes) => {
  let data = [];
  let promises = globes.map(globe => (async () => {
    if(!ignoreAddresses.includes(globe.toLowerCase())) {
      let gauge = await fetchGauge(globe);
      if(gauge != config.zero) {
        let controller = await fetchController(globe);
        let token = await fetchToken(globe);
        let strategy = await fetchStrategy(controller, token.address);
        let platform = await fetchPlatform(token, strategy, globe);
        let type = lpSymbols.includes(token.symbol) ? 'lp' : 'single';
        if(type === 'lp') {
          let underlyingTokens = await fetchUnderlyingTokens(token.address);
          data.push({platform, type, globe, strategy, gauge, controller, token, underlyingTokens});
        } else {
          data.push({platform, type, globe, strategy, gauge, controller, token});
        }
      }
    }
    updateProgress();
  })());
  await Promise.all(promises);
  return data;
}

/* ====================================================================================================================================================== */

// Function to write data to JSON file:
const writeJSON = (data) => {
  fs.writeFile('./pools.json', JSON.stringify(data, null, ' '), 'utf8', (err) => {
    if(err) {
      console.error(err);
    } else {
      console.info(`  > Successfully updated JSON file.`);
    }
  });
}

/* ====================================================================================================================================================== */

// Function to write data to Markdown file:
const writeMarkdown = (data) => {
  let formattedData = '# Compounding Contracts\n\n';
  config.platforms.forEach(platform => {
    let header = `## ${platform} Strategies\n\n`;
    let tableData = [['Name', 'Deposit', 'Strategy', 'Gauge']];
    let pools = data.filter(pool => pool.platform === platform);
    pools.forEach(pool => {
      let name;
      if(pool.type === 'lp') {
        if(pool.underlyingTokens.token0.symbol === 'WAVAX') {
          name = `\`AVAX - ${pool.underlyingTokens.token1.symbol}\``;
        } else if(pool.underlyingTokens.token1.symbol === 'WAVAX') {
          name = `\`AVAX - ${pool.underlyingTokens.token0.symbol}\``;
        } else {
          name = `\`${pool.underlyingTokens.token0.symbol} - ${pool.underlyingTokens.token1.symbol}\``;
        }
      } else {
        name = pool.token.symbol;
      }
      tableData.push([name, pool.globe, pool.strategy, pool.gauge]);
    });
    let table = formatTable(tableData);
    formattedData += header + table + '\n\n';
  });
  fs.writeFile('./pools.md', formattedData, 'utf8', (err) => {
    if(err) {
      console.error(err);
    } else {
      console.info(`  > Successfully updated Markdown file.`);
    }
  });
}

/* ====================================================================================================================================================== */

// Function to format Markdown table:
const formatTable = (tableData) => {
  let table = '';
  let columns = tableData[0].length;
  for(let i = 0; i < columns; i++) {
    table += tableData[0][i];
    if(i < columns - 1) {
      table += ' | ';
    } else {
      table += '\n';
    }
  }
  for(let i = 0; i < columns; i++) {
    table += '---';
    if(i < columns - 1) {
      table += ' | ';
    } else {
      table += '\n';
    }
  }
  tableData.slice(1).forEach(row => {
    for(let i = 0; i < columns; i++) {
      table += row[i];
      if(i < columns - 1) {
        table += ' | ';
      } else {
        table += '\n';
      }
    }
  });
}

/* ====================================================================================================================================================== */

// Function to fetch all data:
const fetch = async () => {

  // Initializations:
  let data = [];
  let startBatch = 0;
  let endBatch = batchSize;

  // Fetching SnowGlobes:
  console.info(`  > Starting blockchain calls...`);
  let globes = await fetchGlobes();
  maxProgress = globes.length;

  // Fetching Data:
  while(progress < maxProgress) {
    data.push(...(await fetchBatch(globes.slice(startBatch, endBatch))));
    startBatch += batchSize;
    endBatch += batchSize;
  }

  // JSON Output:
  writeJSON(data);

  // Markdown Output:
  writeMarkdown(data);

}

/* ====================================================================================================================================================== */

// Fetching Data:
fetch();
