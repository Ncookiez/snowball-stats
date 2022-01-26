
// Required Packages:
const { writeText, getCovalentTXs } = require('../functions.js');
const config = require('../config.js');
const pools = require('../outputs/pools.json');

// Initializations:
let data = '';

/* ====================================================================================================================================================== */

// Function to get gas spent on globes:
const getGasSpentGlobes = async () => {
  let txs = [];
  let avaxSpent = 0;
  for(let i = 0; i < pools.length; i++) {
    txs.push(...(await getCovalentTXs(pools[i].globe)));
    console.log(`Loaded globe transactions... (${i + 1}/${pools.length})`);
  }
  txs.forEach(tx => {
    avaxSpent += ((tx.gas_spent * tx.gas_price) / (10 ** 18));
  });
  return avaxSpent;
}

/* ====================================================================================================================================================== */

// Function to get gas spent on strategies:
const getGasSpentStrategies = async () => {
  let txs = [];
  let avaxSpent = 0;
  for(let i = 0; i < pools.length; i++) {
    txs.push(...(await getCovalentTXs(pools[i].strategy)));
    console.log(`Loaded strategy transactions... (${i + 1}/${pools.length})`);
  }
  txs.forEach(tx => {
    avaxSpent += ((tx.gas_spent * tx.gas_price) / (10 ** 18));
  });
  return avaxSpent;
}

/* ====================================================================================================================================================== */

// Function to get gas spent on gauges:
const getGasSpentGauges = async () => {
  let txs = [];
  let avaxSpent = 0;
  for(let i = 0; i < pools.length; i++) {
    txs.push(...(await getCovalentTXs(pools[i].gauge)));
    console.log(`Loaded gauge transactions... (${i + 1}/${pools.length})`);
  }
  txs.forEach(tx => {
    avaxSpent += ((tx.gas_spent * tx.gas_price) / (10 ** 18));
  });
  return avaxSpent;
}

/* ====================================================================================================================================================== */

// Function to get gas spent on deprecated globes:
const getGasSpentDeprecatedGlobes = async () => {
  let txs = [];
  let avaxSpent = 0;
  for(let i = 0; i < config.deprecatedGlobes.length; i++) {
    txs.push(...(await getCovalentTXs(config.deprecatedGlobes[i])));
    console.log(`Loaded deprecated globe transactions... (${i + 1}/${config.deprecatedGlobes.length})`);
  }
  txs.forEach(tx => {
    avaxSpent += ((tx.gas_spent * tx.gas_price) / (10 ** 18));
  });
  return avaxSpent;
}

/* ====================================================================================================================================================== */

// Function to get gas spent on deprecated gauges:
const getGasSpentDeprecatedGauges = async () => {
  let txs = [];
  let avaxSpent = 0;
  for(let i = 0; i < config.deprecatedGauges.length; i++) {
    txs.push(...(await getCovalentTXs(config.deprecatedGauges[i])));
    console.log(`Loaded deprecated gauge transactions... (${i + 1}/${config.deprecatedGauges.length})`);
  }
  txs.forEach(tx => {
    avaxSpent += ((tx.gas_spent * tx.gas_price) / (10 ** 18));
  });
  return avaxSpent;
}

/* ====================================================================================================================================================== */

// Function to fetch all stats:
const fetch = async () => {

  // Adding Banner:
  data += '\n  ==============================\n';
  data += '  ||         Gas Stats        ||\n';
  data += '  ==============================\n\n';

  // Fetching Data:
  let globesGas = await getGasSpentGlobes();
  let strategiesGas = await getGasSpentStrategies();
  let gaugesGas = await getGasSpentGauges();
  let deprecatedGlobesGas = await getGasSpentDeprecatedGlobes();
  let deprecatedGaugesGas = await getGasSpentDeprecatedGauges();

  // Writing Data:
  data += `  - Total Gas Spent: ${(globesGas + strategiesGas + gaugesGas + deprecatedGlobesGas + deprecatedGaugesGas).toFixed(2)} AVAX\n`;
  data += `  - Gas Spent On Globes: ${globesGas.toFixed(2)} AVAX\n`;
  data += `  - Gas Spent On Strategies: ${strategiesGas.toFixed(2)} AVAX\n`;
  data += `  - Gas Spent On Gauges: ${gaugesGas.toFixed(2)} AVAX\n`;
  data += `  - Gas Spent On Deprecated Globes: ${deprecatedGlobesGas.toFixed(2)} AVAX\n`;
  data += `  - Gas Spent On Deprecated Gauges: ${deprecatedGaugesGas.toFixed(2)} AVAX\n`;

  // Updating Text File:
  writeText(data, 'gasStats');
}

/* ====================================================================================================================================================== */

// Fetching Data:
fetch();
