
// Required Packages:
const { query, writeText, pad } = require('../functions.js');
const axios = require('axios');
const config = require('../config.js');

// Initializations:
const time = Math.round(Date.now() / 1000);
const week = 604800;
let data = '';

/* ====================================================================================================================================================== */

// Function to get distribution timestamps:
const getTimestamps = async () => {
  let timestamps = [];
  let startTime = parseInt(await query(config.axialFeeDistributor, config.feeDistributorABI, 'start_time', []));
  let tempTime = startTime;
  while(tempTime < (time - week)) {
    timestamps.push(tempTime);
    tempTime += week;
  }
  console.log('Timestamps fetched...');
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
  for(let i = 0; i < timestamps.length; i++) {
    let sum = 0;
    txs.forEach(tx => {
      if(i === timestamps.length - 1) {
        if(tx.timestamp > timestamps[i] && tx.timestamp < time) {
          sum += tx.amount;
        }
      } else {
        if(tx.timestamp > timestamps[i] && tx.timestamp < timestamps[i + 1]) {
          sum += tx.amount;
        }
      }
    });
    distributions.push({timestamp: timestamps[i], amount: sum});
  }
  distributions.sort((a, b) => a.timestamp - b.timestamp);
  console.log('Distributions from council TXs fetched...');
  return distributions;
}

/* ====================================================================================================================================================== */

// Function to get council transactions:
const getCouncilTXs = async () => {
  let txs = [];
  let page = 0;
  let hasNextPage = false;
  do {
    try {
      let query = `https://api.covalenthq.com/v1/43114/address/${config.axialFeeDistributor}/transfers_v2/?contract-address=${config.axial}&page-size=1000&page-number=${page++}&key=${config.ckey}`;
      let result = await axios.get(query);
      if(!result.data.error) {
        hasNextPage = result.data.data.pagination.has_more;
        let promises = result.data.data.items.map(tx => (async () => {
          if(tx.successful && tx.to_address.toLowerCase() === config.council.toLowerCase()) {
            let timestamp = (new Date(tx.block_signed_at)).getTime() / 1000;
            let amount = tx.transfers[0].delta / (10 ** 18);
            txs.push({timestamp, amount});
          }
        })());
        await Promise.all(promises);
        console.log(`Council transactions loaded... (Page ${page})`);
      } else {
        hasNextPage = false;
      }
    } catch {
      console.log('API ERROR: Covalent is likely down.');
      hasNextPage = false;
    }
  } while(hasNextPage);
  return txs;
}

/* ====================================================================================================================================================== */

// Function to fetch all stats:
const fetch = async () => {

  // Adding Banner:
  data += '\n  ===============================\n';
  data += '  ||    AXIAL Distributions    ||\n';
  data += '  ===============================\n\n'

  // Fetching Data:
  let timestamps = await getTimestamps();
  let contractDistributions = await getContractDistributions(timestamps);
  let councilDistributions = await getCouncilDistributions(timestamps);

  // Writing Data:
  timestamps.forEach(timestamp => {
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
