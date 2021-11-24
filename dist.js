
// Required Packages:
const { ethers } = require('ethers');

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
      let tokens = parseInt(await contract.tokens_per_week(timestamp)) / (10**18);
      distributions.push({ timestamp, tokens });
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
  console.log('SNOB Distributions fetched...');
  return distributions;
}

/* ====================================================================================================================================================== */

// Function to get AXIAL distributions:
const getAxialDistributions = async () => {
  let contract = new ethers.Contract(config.axialFeeDistributor, config.feeDistributorABI, avax);
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
      let tokens = parseInt(await contract.tokens_per_week(timestamp)) / (10**18);
      distributions.push({ timestamp, tokens });
    } catch {
      console.log('RPC ERROR: Call Rejected - Could not get AXIAL distribution at', timestamp);
    }
  })());
  await Promise.all(promises);
  distributions.sort((a, b) => a.timestamp - b.timestamp);
  let i = 1;
  distributions.forEach(distribution => {
    distribution.week = i++;
  });
  console.log('AXIAL Distributions fetched...');
  return distributions;
}

/* ====================================================================================================================================================== */

// Function to get total distribution:
const getTotalDistribution = (distributions) => {
  let sum = 0;
  distributions.forEach(distribution => {
    sum += distribution.tokens;
  });
  return sum;
}

/* ====================================================================================================================================================== */

// Function to get average distribution:
const getAvgDistribution = (total, distributions) => {
  let avgDistribution = total / distributions.length;
  return avgDistribution;
}

/* ====================================================================================================================================================== */

// Function to get total xSNOB supply:
const getXSNOBSupply = async () => {
  let contract = new ethers.Contract(config.xsnob, config.xsnobABI, avax);
  let supply = parseInt(await contract.totalSupply());
  console.log('Total xSNOB Supply loaded...');
  return supply / (10**18);
}

/* ====================================================================================================================================================== */

// Function to get last distribution APR:
const getLastAPR = (xsnob, distribution) => {
  let apr = ((distribution.tokens * 52) / xsnob) * 100;
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
  let axialDistributions = await getAxialDistributions();
  let xSNOBSupply = await getXSNOBSupply();
  let totalDistribution = getTotalDistribution(distributions);
  let totalAxialDistribution = getTotalDistribution(axialDistributions);
  let avgDistribution = getAvgDistribution(totalDistribution, distributions);
  let avgAxialDistribution = getAvgDistribution(totalAxialDistribution, axialDistributions);
  let lastAPR = getLastAPR(xSNOBSupply, distributions.slice(-1)[0]);

  // <TODO> Add AXIAL dists to list.
  // <TODO> Calculate AXIAL APR and total APR.
  // <TODO> Calculate all-time APR.

  // Printing Data:
  console.log('\n  ==============================');
  console.log('  ||    Distribution Stats    ||');
  console.log('  ==============================\n');
  console.log('  - Total SNOB Distributed:', totalDistribution.toLocaleString(undefined, {maximumFractionDigits: 0}), 'SNOB');
  console.log('  - Total AXIAL Distributed:', totalAxialDistribution.toLocaleString(undefined, {maximumFractionDigits: 0}), 'AXIAL');
  console.log('  - Average SNOB Distribution:', avgDistribution.toLocaleString(undefined, {maximumFractionDigits: 0}), 'SNOB');
  console.log('  - Average AXIAL Distribution:', avgAxialDistribution.toLocaleString(undefined, {maximumFractionDigits: 0}), 'AXIAL');
  console.log('  - List of Distributions:');
  distributions.forEach(distribution => {
    let rawDate = new Date((distribution.timestamp + week) * 1000);
    let date = pad(rawDate.getUTCDate()) + '/' + pad(rawDate.getUTCMonth()) + '/' + rawDate.getUTCFullYear();
    if(distribution.week < 10) {
      console.log('      > Week ', distribution.week.toLocaleString(undefined, {maximumFractionDigits: 0}), '(' + date + ') -', distribution.tokens.toLocaleString(undefined, {maximumFractionDigits: 0}), 'SNOB');
    } else {
      console.log('      > Week', distribution.week.toLocaleString(undefined, {maximumFractionDigits: 0}), '(' + date + ') -', distribution.tokens.toLocaleString(undefined, {maximumFractionDigits: 0}), 'SNOB');
    }
  });
  console.log('  - Total xSNOB Supply:', xSNOBSupply.toLocaleString(undefined, {maximumFractionDigits: 0}), 'xSNOB');
  console.log('  - Last Distribution Estimated APR:', lastAPR.toFixed(2) + '%');
}

/* ====================================================================================================================================================== */

// Fetching Data:
fetch();
