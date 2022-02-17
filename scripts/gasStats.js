
// Required Packages:
const { writeText, getCovalentTXs } = require('../functions.js');
const config = require('../config.js');
const pools = require('../outputs/pools.json');

// Initializations:
let data = '';
let progress = 0;
let maxProgress = 0;

/* ====================================================================================================================================================== */

// Function to communicate script progress to user:
const updateProgress = (text) => {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  if(++progress < maxProgress) {
    process.stdout.write(`${text} (${progress}/${maxProgress})`);
  } else {
    process.stdout.write(`${text} (Done)\n`);
  }
}

/* ====================================================================================================================================================== */

// Function to get gas spent on globes:
const getGasSpentGlobes = async () => {
  let txs = [];
  let avaxSpent = 0;
  progress = 0;
  maxProgress = pools.length;
  for(let i = 0; i < pools.length; i++) {
    txs.push(...(await getCovalentTXs(pools[i].globe)));
    updateProgress('Loading globe transactions...');
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
  progress = 0;
  maxProgress = pools.length;
  for(let i = 0; i < pools.length; i++) {
    if(pools[i].strategy != undefined) {
      txs.push(...(await getCovalentTXs(pools[i].strategy)));
    } else {
      for(let j = 0; j < pools[i].strategies.length; j++) {
        txs.push(...(await getCovalentTXs(pools[i].strategies[j].address)));
      }
    }
    updateProgress('Loading strategy transactions...');
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
  progress = 0;
  maxProgress = pools.length;
  for(let i = 0; i < pools.length; i++) {
    txs.push(...(await getCovalentTXs(pools[i].gauge)));
    updateProgress('Loading gauge transactions...');
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
  progress = 0;
  maxProgress = config.deprecatedGlobes.length;
  for(let i = 0; i < config.deprecatedGlobes.length; i++) {
    txs.push(...(await getCovalentTXs(config.deprecatedGlobes[i])));
    updateProgress('Loading deprecated globe transactions...');
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
  progress = 0;
  maxProgress = config.deprecatedGauges.length;
  for(let i = 0; i < config.deprecatedGauges.length; i++) {
    txs.push(...(await getCovalentTXs(config.deprecatedGauges[i])));
    updateProgress('Loading deprecated gauge transactions...');
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
