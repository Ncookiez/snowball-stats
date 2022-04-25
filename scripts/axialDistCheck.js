
// Required Packages:
const { query, queryBlocks, writeText, pad } = require('../functions.js');
const config = require('../config.js');

// Initializations:
const time = Math.round(Date.now() / 1000);
const week = 604800;
let data = '';

/* ====================================================================================================================================================== */

// Function to get distribution timestamps:
const getDistributionTimestamps = () => {
  let timestamps = [];
  let tempTime = config.axialFirstDistribution.timestamp;
  while(tempTime < (time - week)) {
    timestamps.push(tempTime);
    tempTime += week;
  }
  return timestamps;
}

/* ====================================================================================================================================================== */

// Function to get AXIAL distributions from fee distributor contract:
const getContractDistributions = async (timestamps) => {
  let distributions = [];
  let promises = timestamps.map(timestamp => (async () => {
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
const getCouncilDistributions = async (timestamps) => {
  let distributions = [];
  let txs = await getCouncilTXs();
  let lastData = config.weeklyData[config.weeklyData.length - 1];
  if(lastData) {
    let lastBlock = lastData.block;
    timestamps.forEach(timestamp => {
      let amount = 0;
      txs.forEach(tx => {
        let data = config.weeklyData.find(i => i.timestamp === timestamp);
        if(data) {
          if(timestamps.indexOf(timestamp) === timestamps.length - 2) {
            if(tx.block > data.block) {
              amount += tx.amount;
            }
          } else {
            let nextData = config.weeklyData.find(i => i.timestamp === timestamp + week);
            if(nextData) {
              if(tx.block > data.block && tx.block < nextData.block) {
                amount += tx.amount;
              }
            } else {
              console.error(`No weekly data found for timestamp: ${timestamp + week}`);
              process.exit(1);
            }
          }
        } else {
          console.error(`No weekly data found for timestamp: ${timestamp}`);
          process.exit(1);
        }
      });
      distributions.push({timestamp, amount});
    });
  } else {
    console.error(`No weekly data found for last datapoint.`);
    process.exit(1);
  }
  distributions.sort((a, b) => a.timestamp - b.timestamp);
  console.log('Distributions from council TXs fetched...');
  return distributions;
}

/* ====================================================================================================================================================== */

// Function to get council transactions:
const getCouncilTXs = async () => {
  let txs = [];
  let events = await queryBlocks(config.axial, config.transferEventABI, 'Transfer', config.axialFirstDistribution.block, 100000, [null, config.axialFeeDistributor]);
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
  let distributionTimestamps = getDistributionTimestamps();
  let contractDistributions = await getContractDistributions(distributionTimestamps);
  let councilDistributions = await getCouncilDistributions(distributionTimestamps);
  let totalContractDistribution = getTotalDist(contractDistributions);
  let totalCouncilDistribution = getTotalDist(councilDistributions);

  // Writing Data:
  data += `  - Total Contract Distributions: ${totalContractDistribution.toLocaleString(undefined, {maximumFractionDigits: 0})} AXIAL\n`;
  data += `  - Total Council Distributions:  ${totalCouncilDistribution.toLocaleString(undefined, {maximumFractionDigits: 0})} AXIAL\n\n`;
  distributionTimestamps.forEach(timestamp => {
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
