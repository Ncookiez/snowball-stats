
// Required Packages:
const { ethers } = require('ethers');
const axios = require('axios');

// Required Config Variables:
const config = require('./config.js');

// Setting Up RPC:
const avax = new ethers.providers.JsonRpcProvider(config.rpc);

// Setting Time Variables:
const time = Math.round(Date.now() / 1000);
const week = 604800;

/* ====================================================================================================================================================== */

// Function to get SNOB distributions:
const getDistributions = async () => {
  let contract = new ethers.Contract(config.feeDistributor, config.feeDistributorABI, avax);
  let axialContract = new ethers.Contract(config.axialFeeDistributor, config.feeDistributorABI, avax);
  let startTime = parseInt(await contract.start_time());
  let timestamps = [];
  let tempTime = startTime;
  while(tempTime < (time - week)) {
    timestamps.push(tempTime);
    tempTime += week;
  }
  let distributions = [];
  let promises = timestamps.map(timestamp => (async () => {
    try {
      let snob = parseInt(await contract.tokens_per_week(timestamp)) / (10 ** 18);
      let axial = parseInt(await axialContract.tokens_per_week(timestamp)) / (10 ** 18);
      distributions.push({ timestamp, snob, axial });
    } catch {
      console.log('RPC ERROR: Call Rejected - Could not get SNOB distribution at', timestamp);
    }
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
  let contract = new ethers.Contract(config.xsnob, config.xsnobABI, avax);
  let supply = parseInt(await contract.totalSupply());
  console.log('Total xSNOB Supply loaded...');
  return supply / (10 ** 18);
}

/* ====================================================================================================================================================== */

// Function to get last distribution APR:
const getLastAPR = async (xsnob, distribution, token) => {
  if(token === 'snob') {
    let apr = ((distribution[token] * 52) / xsnob) * 100;
    console.log('Last SNOB APR loaded...');
    return apr;
  } else if(token === 'axial') {
    let snobPrice = (await axios.get('https://api.coingecko.com/api/v3/simple/token_price/avalanche?contract_addresses=' + config.snob + '&vs_currencies=usd')).data[config.snob.toLowerCase()].usd;
    let axialPrice = (await axios.get('https://api.coingecko.com/api/v3/simple/token_price/avalanche?contract_addresses=' + config.axial + '&vs_currencies=usd')).data[config.axial.toLowerCase()].usd;
    let ratio = snobPrice / axialPrice;
    let apr = (((distribution[token] / ratio) * 52) / xsnob) * 100;
    console.log('Last AXIAL APR loaded...');
    return apr;
  }
}

/* ====================================================================================================================================================== */

// Function to pad date if necessary:
const pad = (num) => {
  let str = num.toString();
  if(str.length < 2) {
    return '0' + str;
  } else {
    return str;
  }
}

/* ====================================================================================================================================================== */

// Function to fetch all stats:
const fetch = async () => {

  // Fetching Data:
  let distributions = await getDistributions();
  let xSNOBSupply = await getXSNOBSupply();
  let lastAPR = await getLastAPR(xSNOBSupply, distributions.slice(-1)[0], 'snob');
  let lastAxialAPR = await getLastAPR(xSNOBSupply, distributions.slice(-1)[0], 'axial');
  let totalDistribution = getTotalDistribution(distributions, 'snob');
  let avgDistribution = getAvgDistribution(totalDistribution, distributions, 'snob');
  let totalAxialDistribution = getTotalDistribution(distributions, 'axial');
  let avgAxialDistribution = getAvgDistribution(totalAxialDistribution, distributions, 'axial');

  // <TODO> Calculate all-time APR. (SNOB, AXIAL and total) (Not in readme yet)

  // Printing Data:
  console.log('\n  ==============================');
  console.log('  ||    Distribution Stats    ||');
  console.log('  ==============================\n');
  console.log('  - Total SNOB Distributed:', totalDistribution.toLocaleString(undefined, {maximumFractionDigits: 0}), 'SNOB');
  console.log('  - Average SNOB Distribution:', avgDistribution.toLocaleString(undefined, {maximumFractionDigits: 0}), 'SNOB');
  console.log('  - Total AXIAL Distributed:', totalAxialDistribution.toLocaleString(undefined, {maximumFractionDigits: 0}), 'AXIAL');
  console.log('  - Average AXIAL Distribution:', avgAxialDistribution.toLocaleString(undefined, {maximumFractionDigits: 0}), 'AXIAL');
  console.log('  - List of Distributions:');
  distributions.forEach(distribution => {
    let rawDate = new Date((distribution.timestamp + week) * 1000);
    let date = pad(rawDate.getUTCDate()) + '/' + pad(rawDate.getUTCMonth()) + '/' + rawDate.getUTCFullYear();
    console.log('      > Week' + (distribution.week < 10 ? ' ' : ''), distribution.week.toLocaleString(undefined, {maximumFractionDigits: 0}), '(' + date + ') -', distribution.snob.toLocaleString(undefined, {maximumFractionDigits: 0}), 'SNOB', (distribution.axial > 0 ? '& ' + distribution.axial.toLocaleString(undefined, {maximumFractionDigits: 0}) + ' AXIAL' : ''));
  });
  console.log('  - Total xSNOB Supply:', xSNOBSupply.toLocaleString(undefined, {maximumFractionDigits: 0}), 'xSNOB');
  console.log('  - Last Distribution Estimated APR:', (lastAPR + lastAxialAPR).toFixed(2) + '%', '(' + lastAPR.toFixed(2) + '% SNOB +', lastAxialAPR.toFixed(2) + '% AXIAL)');
}

/* ====================================================================================================================================================== */

// Fetching Data:
fetch();
