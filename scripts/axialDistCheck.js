
// Required Packages:
const { query, queryBlocks, writeText, pad } = require('../functions.js');
const config = require('../config.js');

// Initializations:
const week = 604800;
let data = '';

/* ====================================================================================================================================================== */

// Function to get AXIAL distributions from fee distributor contract:
const getContractDistributions = async () => {
  let distributions = [];
  let promises = config.axialDistributions.slice(0, -1).map(dist => (async () => {
    let timestamp = dist.timestamp;
    let amount = parseInt(await query(config.axialFeeDistributor, config.feeDistributorABI, 'tokens_per_week', [timestamp])) / (10 ** 18);
    distributions.push({timestamp, amount});
  })());
  await Promise.all(promises);
  distributions.sort((a, b) => a.timestamp - b.timestamp);
  console.log('Distributions from contract fetched...');
  return distributions;
}

/* ====================================================================================================================================================== */

// Function to get AXIAL distributions from council transactions:
const getCouncilDistributions = async () => {
  let distributions = [];
  let txs = await getCouncilTXs();
  for(let i = 0; i < config.axialDistributions.length; i++) {
    let amount = 0;
    txs.forEach(tx => {
      let block = config.axialDistributions[i].block;
      if(i === config.axialDistributions.length - 1) {
        if(tx.block > block) {
          amount += tx.amount;
        }
      } else {
        if(tx.block > block && tx.block < config.axialDistributions[i + 1].block) {
          amount += tx.amount;
        }
      }
    });
    distributions.push({timestamp: config.axialDistributions[i].timestamp, amount});
  }
  distributions.sort((a, b) => a.timestamp - b.timestamp);
  console.log('Distributions from council TXs fetched...');
  return distributions;
}

/* ====================================================================================================================================================== */

// Function to get council transactions:
const getCouncilTXs = async () => {
  let txs = [];
  let events = await queryBlocks(config.axial, config.transferEventABI, 'Transfer', 7052000, 100000, [null, config.axialFeeDistributor]);
  let promises = events.map(event => (async () => {
    let block = event.blockNumber;
    let amount = parseInt(event.args.value) / 10 ** 18;
    txs.push({block, amount});
  })());
  await Promise.all(promises);
  return txs;
}

/* ====================================================================================================================================================== */

// Function to get total distributions:
const getTotalDist = (distributions) => {
  let total = 0;
  distributions.forEach(dist => {
    total += dist.amount;
  });
  return total;
}

/* ====================================================================================================================================================== */

// Function to fetch all stats:
const fetch = async () => {

  // Adding Banner:
  data += '\n  ===============================\n';
  data += '  ||    AXIAL Distributions    ||\n';
  data += '  ===============================\n\n'

  // Fetching Data:
  let contractDistributions = await getContractDistributions();
  let councilDistributions = await getCouncilDistributions();
  let totalContractDistribution = getTotalDist(contractDistributions);
  let totalCouncilDistribution = getTotalDist(councilDistributions);

  // Writing Data:
  data += `Total Contract Distributions: ${totalContractDistribution.toLocaleString(undefined, {maximumFractionDigits: 0})} AXIAL\n`;
  data += `Total Council Distributions:  ${totalCouncilDistribution.toLocaleString(undefined, {maximumFractionDigits: 0})} AXIAL\n\n`;
  config.axialDistributions.slice(0, -1).forEach(axialDistribution => {
    let timestamp = axialDistribution.timestamp;
    let rawDate = new Date((timestamp + week) * 1000);
    let date = pad(rawDate.getUTCDate()) + '/' + pad(rawDate.getUTCMonth() + 1) + '/' + rawDate.getUTCFullYear();
    data += `  - ${date}:\n`;
    data += `      > Contract:    ${contractDistributions.find(dist => dist.timestamp === timestamp).amount.toLocaleString(undefined, {maximumFractionDigits: 0})} AXIAL\n`;
    data += `      > Council TXs: ${councilDistributions.find(dist => dist.timestamp === timestamp).amount.toLocaleString(undefined, {maximumFractionDigits: 0})} AXIAL\n`;
  });

  // Updating Text File:
  writeText(data, 'axialDistributionsCheck');
}

/* ====================================================================================================================================================== */

// Fetching Data:
fetch();
