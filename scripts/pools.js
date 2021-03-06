
// Required Packages:
const { query, writeJSON, formatTable } = require('../functions.js');
const axios = require('axios');
const config = require('../config.js');
const fs = require('fs');

// Setting Up Ignore Addresses:
const ignoreAddresses = [
  '0xb91124ecef333f17354add2a8b944c76979fe3ec', // StableVault
  '0x53b37b9a6631c462d74d65d61e1c056ea9daa637', // Weird PNG-ETH LP Token
  '0xa9ff3d5de5dd50a0b64c7e82f158de9c3be611ce'  // Misplaced Kyber Strategy
];

// Setting Up Single-Asset Trader Joe Strategies:
const singleTraderJoeStrats = [
  '0x8c06828a1707b0322baaa46e3b0f4d1d55f6c3e6'  // xJOE
];

// Initializations:
const lpSymbols = ['PGL', 'JLP'];
const batchSize = 50;
let progress = 0;
let maxProgress = 0;
let erroredPools = [];

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

// Function to fetch pool data from API:
const fetchAPI = async () => {
  console.info(`  > Fetching API data...`);
  let url = 'https://api.snowapi.net/graphql';
  let method = 'post';
  let data = {query: 'query { SnowglobeContracts { pair, snowglobeAddress, gaugeAddress }}'};
  try {
    let pools = (await axios({url, method, data})).data.data.SnowglobeContracts;
    return pools;
  } catch {
    console.error(`  > Error fetching API data.`);
    console.warn(`  > Execution was stopped due to errors. Check script or try again.`);
    process.exit(1);
  }
}

/* ====================================================================================================================================================== */

// Function to fetch all SnowGlobe addresses:
const fetchGlobes = async () => {
  console.info(`  > Starting blockchain calls...`);
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
const fetchPlatform = async (token, strategy, globe, controller) => {
  let platform = null;
  if(controller.toLowerCase() === config.optimizedPoolController) {
    platform = 'Optimized';
  } else if(token.symbol === 'PGL') {
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
    } else if(name.startsWith('Platypus')) {
      platform = 'Platypus';
    } else if(name.startsWith('Vtx')) {
      platform = 'Vector';
    } else {
      console.warn(` - Unidentified pool platform detected: ${name}`);
    }
  }
  return platform;
}

/* ====================================================================================================================================================== */

// Function to fetch batch of data:
const fetchBatch = async (globes, apiPools) => {
  let data = [];
  let promises = globes.map(globe => (async () => {
    if(!ignoreAddresses.includes(globe.toLowerCase())) {
      let gauge = await fetchGauge(globe);
      if(gauge != config.zero) {
        let controller = await fetchController(globe);
        let token = await fetchToken(globe);
        let strategy = await fetchStrategy(controller, token.address);
        if(strategy != config.zero) {
          let apiPool = apiPools.find(pool => pool.snowglobeAddress.toLowerCase() === globe.toLowerCase());
          if(apiPool) {
            if(apiPool.gaugeAddress.toLowerCase() === gauge.toLowerCase()) {
              let platform = await fetchPlatform(token, strategy, globe, controller);
              let type = lpSymbols.includes(token.symbol) ? 'lp' : 'single';
              if(type === 'lp') {
                let underlyingTokens = await fetchUnderlyingTokens(token.address);
                let name = '';
                if(underlyingTokens.token0.symbol === 'WAVAX') {
                  name = `AVAX-${underlyingTokens.token1.symbol}`;
                } else if(underlyingTokens.token1.symbol === 'WAVAX') {
                  name = `AVAX-${underlyingTokens.token0.symbol}`;
                } else {
                  name = `${underlyingTokens.token0.symbol}-${underlyingTokens.token1.symbol}`;
                }
                data.push({name, platform, type, globe, strategy, gauge, controller, token, underlyingTokens});
              } else {
                let name = token.symbol;
                if(platform === 'Optimized') {
                  data.push({name, platform, type, globe, strategies: config.optimizedPoolStrategies[name], gauge, controller, token});
                } else {
                  data.push({name, platform, type, globe, strategy, gauge, controller, token});
                }
              }
            } else {
              let error = 'Wrong Gauge on API';
              erroredPools.push({globe, strategy, gauge, controller, token, error});
            }
          } else {
            let error = 'Not on API (Should Probably be Deprecated)';
            erroredPools.push({globe, strategy, gauge, controller, token, error});
          }
        } else {
          let error = 'No Strategy';
          erroredPools.push({globe, strategy, gauge, controller, token, error});
        }
      }
    }
    updateProgress();
  })());
  await Promise.all(promises);
  return data;
}

/* ====================================================================================================================================================== */

// Function to write data to Markdown file:
const writeMarkdown = (data) => {
  let formattedData = '# Compounding Contracts\n\n';
  config.platforms.forEach(platform => {
    let header = `## ${platform} Strategies\n\n`;
    let tableData = [];
    if(platform != 'Optimized') {
      tableData.push(['Name', 'Deposit', 'Strategy', 'Gauge']);
      let pools = data.filter(pool => pool.platform === platform);
      pools.forEach(pool => {
        let name = `\`${pool.name}\``.replace('-', ' - ');
        let deposit = `[Deposit](https://snowtrace.io/address/${pool.globe})`;
        let strategy = `[Strategy](https://snowtrace.io/address/${pool.strategy})`;
        let gauge = `[Gauge](https://snowtrace.io/address/${pool.gauge})`;
        tableData.push([name, deposit, strategy, gauge]);
      });
    } else {
      tableData.push(['Name', 'Deposit', 'Strategies', 'Gauge']);
      let pools = data.filter(pool => pool.platform === platform);
      pools.forEach(pool => {
        let name = `\`${pool.name}\``;
        let deposit = `[Deposit](https://snowtrace.io/address/${pool.globe})`;
        let strategies = '';
        pool.strategies.forEach(strategy => {
          strategies += `[${strategy.platform}](https://snowtrace.io/address/${strategy.address}), `;
        });
        let gauge = `[Gauge](https://snowtrace.io/address/${pool.gauge})`;
        tableData.push([name, deposit, strategies.slice(0, -2), gauge]);
      });
    }
    let table = formatTable(tableData);
    formattedData += header + table + '\n';
  });
  fs.writeFile('./outputs/pools.md', formattedData, 'utf8', (err) => {
    if(err) {
      console.error(err);
    }
  });
}

/* ====================================================================================================================================================== */

// Function to fetch all data:
const fetch = async () => {

  // Initializations:
  let data = [];
  let apiData = [];
  let startBatch = 0;
  let endBatch = batchSize;

  // Fetching API Data:
  apiData.push(...(await fetchAPI()));

  // Fetching SnowGlobes:
  let globes = await fetchGlobes();
  maxProgress = globes.length;

  // Fetching Data:
  while(progress < maxProgress) {
    data.push(...(await fetchBatch(globes.slice(startBatch, endBatch), apiData)));
    startBatch += batchSize;
    endBatch += batchSize;
  }

  // Sorting Data:
  data.sort((a, b) => {
    if(a.type === 'lp') {
      if(b.type === 'lp') {
        let nameSort = a.name.localeCompare(b.name);
        if(nameSort === 0) {
          return a.globe.localeCompare(b.globe);
        } else {
          return nameSort;
        }
      } else {
        return -1;
      }
    } else if(b.type === 'lp') {
      return 1;
    } else {
      let nameSort = a.name.localeCompare(b.name);
      if(nameSort === 0) {
        return a.globe.localeCompare(b.globe);
      } else {
        return nameSort;
      }
    }
  });

  // JSON Output:
  writeJSON(data, 'pools');

  // Markdown Output:
  writeMarkdown(data);

  // Sorting Error Data:
  erroredPools.sort((a, b) => a.globe.localeCompare(b.globe));

  // Logging Errored Pools:
  writeJSON(erroredPools, 'erroredPools');

}

/* ====================================================================================================================================================== */

// Fetching Data:
fetch();
