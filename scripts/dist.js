
// Required Packages:
const { query, writeText, pad, getTokenPrice } = require('../functions.js');
const axios = require('axios');
const config = require('../config.js');

// Manually Inputting Wrong CoinGecko AXIAL Prices:
const axialPrices = [
  { timestamp: 1639612800, price: 0.0480 },
  { timestamp: 1640217600, price: 0.0313 },
  { timestamp: 1640822400, price: 0.0213 }
];

// Manually Inputting Wrong Token Checkpoints:
const axialCheckpoints = [
  { timestamp: 1639612800, amount: 1009389 },
  { timestamp: 1640822400, amount: 1064910 },
  { timestamp: 1641427200, amount: 997074 }
];

// Initializations:
const time = Math.round(Date.now() / 1000);
const week = 604800;
let data = '';


/* ====================================================================================================================================================== */

// Function to get SNOB distributions:
const getDistributions = async () => {
  let startTime = parseInt(await query(config.feeDistributor, config.feeDistributorABI, 'start_time', []));
  let timestamps = [];
  let tempTime = startTime;
  while(tempTime < (time - week)) {
    timestamps.push(tempTime);
    tempTime += week;
  }
  let distributions = [];
  let promises = timestamps.map(timestamp => (async () => {
    let snob = parseInt(await query(config.feeDistributor, config.feeDistributorABI, 'tokens_per_week', [timestamp])) / (10 ** 18);
    let axial = 0;
    let foundAxialAmount = axialCheckpoints.find(i => i.timestamp === timestamp);
    if(foundAxialAmount) {
      axial = foundAxialAmount.amount;
    } else {
      axial = parseInt(await query(config.axialFeeDistributor, config.feeDistributorABI, 'tokens_per_week', [timestamp])) / (10 ** 18);
    }
    let xsnob = parseInt(await query(config.feeDistributor, config.feeDistributorABI, 've_supply', [timestamp])) / (10 ** 18);
    let apr = await getAPR(xsnob, snob, axial, timestamp);
    distributions.push({ timestamp, snob, axial, apr });
  })());
  await Promise.all(promises);
  distributions.sort((a, b) => a.timestamp - b.timestamp);
  let i = 1;
  distributions.forEach(distribution => {
    distribution.week = i++;
  });
  console.log('Distributions fetched...');
  return distributions;
}

/* ====================================================================================================================================================== */

// Function to get total distribution:
const getTotalDistribution = (distributions, token) => {
  let sum = 0;
  distributions.forEach(distribution => {
    sum += distribution[token];
  });
  return sum;
}

/* ====================================================================================================================================================== */

// Function to get average distribution:
const getAvgDistribution = (total, distributions, token) => {
  let count = 0;
  distributions.forEach(distribution => {
    if(distribution[token] > 0) {
      count++;
    }
  });
  let avgDistribution = total / count;
  return avgDistribution;
}

/* ====================================================================================================================================================== */

// Function to get total xSNOB supply:
const getXSNOBSupply = async () => {
  let supply = parseInt(await query(config.xsnob, config.minABI, 'totalSupply', []));
  console.log('Total xSNOB Supply loaded...');
  return supply / (10 ** 18);
}

/* ====================================================================================================================================================== */

// Function to get distribution APR:
const getAPR = async (xsnob, snob, axial, timestamp) => {
  let snobAPR = ((snob * 52) / xsnob) * 100;
  let axialAPR = 0;
  if(axial > 0) {
    let rawDate = new Date((timestamp + week) * 1000);
    let date = `${pad(rawDate.getUTCDate())}-${pad(rawDate.getUTCMonth() + 1)}-${rawDate.getUTCFullYear()}`;
    let snobPrice;
    try {
      snobPrice = (await axios.get(`https://api.coingecko.com/api/v3/coins/snowball-token/history?date=${date}&localization=false`)).data.market_data.current_price.usd;
    } catch {
      if((timestamp + week) > (time - (week / 7))) {
        snobPrice = await getTokenPrice(config.snob);
      }
    }
    let axialPrice = 0;
    let foundAxialPrice = axialPrices.find(i => i.timestamp === timestamp);
    if(foundAxialPrice) {
      axialPrice = foundAxialPrice.price;
    } else {
      try {
        axialPrice = (await axios.get(`https://api.coingecko.com/api/v3/coins/axial-token/history?date=${date}&localization=false`)).data.market_data.current_price.usd;
      } catch {
        if((timestamp + week) > (time - (week / 7))) {
          axialPrice = await getTokenPrice(config.axial);
        }
      }
    }
    let ratio = snobPrice / axialPrice;
    axialAPR = (((axial / ratio) * 52) / xsnob) * 100;
  }
  return [snobAPR, axialAPR];
}

/* ====================================================================================================================================================== */

// Function to get all-time APR:
const getAllTimeAPR = (distributions) => {
  let sum = 0;
  distributions.forEach(distribution => {
    sum += distribution.apr[0] + distribution.apr[1];
  });
  let apr = sum / distributions.length;
  return apr;
}

/* ====================================================================================================================================================== */

// Function to fetch all stats:
const fetch = async () => {

  // Adding Banner:
  data += '\n  ================================\n';
  data += '  ||     Distribution Stats     ||\n';
  data += '  ================================\n\n'

  // Fetching Data:
  let distributions = await getDistributions();
  let xSNOBSupply = await getXSNOBSupply();
  let totalDistribution = getTotalDistribution(distributions, 'snob');
  let totalAxialDistribution = getTotalDistribution(distributions, 'axial');
  let allTimeAPR = getAllTimeAPR(distributions);
  let avgDistribution = getAvgDistribution(totalDistribution, distributions, 'snob');
  let avgAxialDistribution = getAvgDistribution(totalAxialDistribution, distributions, 'axial');

  // Writing Data:
  data += `  - Total Distributed: ${totalDistribution.toLocaleString(undefined, {maximumFractionDigits: 0})} SNOB & ${totalAxialDistribution.toLocaleString(undefined, {maximumFractionDigits: 0})} AXIAL\n`;
  data += `  - Average Distribution: ${avgDistribution.toLocaleString(undefined, {maximumFractionDigits: 0})} SNOB & ${avgAxialDistribution.toLocaleString(undefined, {maximumFractionDigits: 0})} AXIAL\n`;
  data += '  - List of Distributions:\n';
  distributions.forEach(distribution => {
    let rawDate = new Date((distribution.timestamp + week) * 1000);
    let date = `${pad(rawDate.getUTCDate())}/${pad(rawDate.getUTCMonth() + 1)}/${rawDate.getUTCFullYear()}`;
    data += `      > Week ${(distribution.week < 10 ? ' ' : '')}${distribution.week.toLocaleString(undefined, {maximumFractionDigits: 0})} (${date}) - ${distribution.snob.toLocaleString(undefined, {maximumFractionDigits: 0})} SNOB${(distribution.axial > 0 ? ` & ${distribution.axial.toLocaleString(undefined, {maximumFractionDigits: 0})} AXIAL` : '')} - ${(distribution.apr[0] + distribution.apr[1]).toFixed(2)}% APR${(distribution.axial > 0 ? ` (${distribution.apr[0].toFixed(2)}% SNOB & ${distribution.apr[1].toFixed(2)}% AXIAL)` : '')}\n`;
  });
  data += `  - Total xSNOB Supply: ${xSNOBSupply.toLocaleString(undefined, {maximumFractionDigits: 0})} xSNOB\n`;
  data += `  - All-Time Average APR: ${allTimeAPR.toFixed(2)}%\n`;

  // Updating Text File:
  writeText(data, 'distributionStats');
}

/* ====================================================================================================================================================== */

// Fetching Data:
fetch();
