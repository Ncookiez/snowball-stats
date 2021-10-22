
// Required Packages:
const { ethers } = require('ethers');
const axios = require('axios');

// Required Config & Parameter Variables:
const config = require('./config.js');
const args = process.argv.slice(2);

// Setting Up RPC:
const avax = new ethers.providers.JsonRpcProvider(config.rpc);

/* ====================================================================================================================================================== */

// Function to get SNOB Price:
const getPrice = async () => {
  let query = 'https://api.coingecko.com/api/v3/simple/token_price/avalanche?contract_addresses=' + config.snob + '&vs_currencies=usd';
  let result = await axios.get(query);
  let price = result.data[config.snob.toLowerCase()].usd.toFixed(4);
  return price;
}

/* ====================================================================================================================================================== */

// Function to get total SNOB supply:
const getTotalSupply = async () => {
  let contract = new ethers.Contract(config.snob, config.minABI, avax);
  let supply = await contract.totalSupply();
  return supply / (10**18);
}

/* ====================================================================================================================================================== */

// Function to get # of SNOB holders:
const getHolders = async () => {
  let query = 'https://api.covalenthq.com/v1/43114/tokens/' + config.snob + '/token_holders/?page-size=50000&key=' + config.ckey;
  let result = await axios.get(query);
  let holders = result.data.data.items.length;
  return holders;
}

/* ====================================================================================================================================================== */

// Function to get SNOB in treasury:
const getTreasuryBalance = async () => {
  let treasuryBalance = 0;
  let contract = new ethers.Contract(config.snob, config.minABI, avax);
  let promises = config.treasury.map(address => (async () => {
    let addressBalance = parseInt(await contract.balanceOf(address));
    treasuryBalance += addressBalance;
  })());
  await Promise.all(promises);
  return treasuryBalance / (10**18);
}

/* ====================================================================================================================================================== */

// Function to get staked SNOB supply:
const getStaked = async () => {
  let contract = new ethers.Contract(config.snob, config.minABI, avax);
  let balance = parseInt(await contract.balanceOf(config.xsnob));
  return balance / (10**18);
}

/* ====================================================================================================================================================== */

// Function to get # of SNOB stakers (xSNOB):
const getStakers = async () => {
  // <TODO>
}

/* ====================================================================================================================================================== */

// Function to fetch all stats:
const fetch = async () => {

  // Fetching Data:
  let price = await getPrice();
  let totalSupply = await getTotalSupply();
  let holders = await getHolders();
  let treasuryBalance = await getTreasuryBalance();
  let staked = await getStaked();
  // let stakers = await getStakers();

  // Printing Data:
  console.log('==============================');
  console.log('||        SNOB Stats        ||');
  console.log('==============================');
  console.log('- SNOB Price:', '$' + price);
  console.log('- Total SNOB Supply:', totalSupply.toLocaleString(undefined, {maximumFractionDigits: 0}));
  console.log('- SNOB Market Cap:', '$' + (price * totalSupply).toLocaleString(undefined, {maximumFractionDigits: 0}));
  console.log('- SNOB Holders:', holders.toLocaleString(undefined, {maximumFractionDigits: 0}));
  console.log('- Treasury:', '$' + (price * treasuryBalance).toLocaleString(undefined, {maximumFractionDigits: 0}), '(' + treasuryBalance.toLocaleString(undefined, {maximumFractionDigits: 0}) + ' SNOB)');
  console.log('- Staked SNOB:', staked.toLocaleString(undefined, {maximumFractionDigits: 0}), '(' + ((staked / totalSupply) * 100).toFixed(2) + '%)');
  console.log('- Circulating SNOB Supply:', (totalSupply - treasuryBalance - staked).toLocaleString(undefined, {maximumFractionDigits: 0}), '(' + (((totalSupply - treasuryBalance - staked) / totalSupply) * 100).toFixed(2) + '%)');

}

/* ====================================================================================================================================================== */

// Fetching Data:
fetch();
