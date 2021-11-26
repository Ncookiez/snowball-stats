
// Required Packages:
const { ethers } = require('ethers');
const axios = require('axios');

// Required Config Variables:
const config = require('./config.js');

// Setting Up RPC:
const avax = new ethers.providers.JsonRpcProvider(config.rpc);
const avax_backup = new ethers.providers.JsonRpcProvider(config.rpc_backup);

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
      let xsnob = parseInt(await contract.ve_supply(timestamp)) / (10 ** 18);
      let apr = await getAPR(xsnob, snob, axial);
      distributions.push({ timestamp, snob, axial, apr });
    } catch {
      try {
        console.log('Using backup RPC...');
        let contract = new ethers.Contract(config.feeDistributor, config.feeDistributorABI, avax_backup);
        let axialContract = new ethers.Contract(config.axialFeeDistributor, config.feeDistributorABI, avax_backup);
        let snob = parseInt(await contract.tokens_per_week(timestamp)) / (10 ** 18);
        let axial = parseInt(await axialContract.tokens_per_week(timestamp)) / (10 ** 18);
        let xsnob = parseInt(await contract.ve_supply(timestamp)) / (10 ** 18);
        let apr = await getAPR(xsnob, snob, axial);
        distributions.push({ timestamp, snob, axial, apr });
      } catch {
        console.log('RPC ERROR: Call Rejected - Could not get SNOB distribution at', timestamp);
      }
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

// Function to get distribution APR:
const getAPR = async (xsnob, snob, axial) => {
  let snobAPR = ((snob * 52) / xsnob) * 100;
  let snobPrice = (await axios.get('https://api.coingecko.com/api/v3/simple/token_price/avalanche?contract_addresses=' + config.snob + '&vs_currencies=usd')).data[config.snob.toLowerCase()].usd;
  let axialPrice = (await axios.get('https://api.coingecko.com/api/v3/simple/token_price/avalanche?contract_addresses=' + config.axial + '&vs_currencies=usd')).data[config.axial.toLowerCase()].usd;
  let ratio = snobPrice / axialPrice;
  let axialAPR = (((axial / ratio) * 52) / xsnob) * 100;
  return [snobAPR, axialAPR];
}

/* ====================================================================================================================================================== */

// Function to get all-time APR:
const getAllTimeAPR = async (distributions) => {
  let sum = 0;
  distributions.forEach(distribution => {
    sum += distribution.apr[0] + distribution.apr[1];
  });
  let apr = sum / distributions.length;
  console.log('All-Time APR loaded...');
  return apr;
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
  let totalDistribution = getTotalDistribution(distributions, 'snob');
  let totalAxialDistribution = getTotalDistribution(distributions, 'axial');
  let allTimeAPR = await getAllTimeAPR(distributions);
  let avgDistribution = getAvgDistribution(totalDistribution, distributions, 'snob');
  let avgAxialDistribution = getAvgDistribution(totalAxialDistribution, distributions, 'axial');

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
    let date = pad(rawDate.getUTCDate()) + '/' + pad(rawDate.getUTCMonth() + 1) + '/' + rawDate.getUTCFullYear();
    console.log('      > Week' + (distribution.week < 10 ? ' ' : ''), distribution.week.toLocaleString(undefined, {maximumFractionDigits: 0}), '(' + date + ') -', distribution.snob.toLocaleString(undefined, {maximumFractionDigits: 0}), 'SNOB' + (distribution.axial > 0 ? ' & ' + distribution.axial.toLocaleString(undefined, {maximumFractionDigits: 0}) + ' AXIAL' : ''), '- ' + (distribution.apr[0] + distribution.apr[1]).toFixed(2) + '% APR', (distribution.axial > 0 ? '(' + distribution.apr[0].toFixed(2) + '% SNOB & ' + distribution.apr[1].toFixed(2) + '% AXIAL)' : ''));
  });
  console.log('  - Total xSNOB Supply:', xSNOBSupply.toLocaleString(undefined, {maximumFractionDigits: 0}), 'xSNOB');
  console.log('  - All-Time Average APR:', allTimeAPR.toFixed(2) + '%');
}

/* ====================================================================================================================================================== */

// Fetching Data:
fetch();
