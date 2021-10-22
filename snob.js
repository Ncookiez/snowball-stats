
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

// Function to get # of SNOB holders:
const getHolders = async () => {
  // <TODO>
}

/* ====================================================================================================================================================== */

// Function to get info on SNOB transactions:
const getTXs = async () => {
  // <TODO - Total TX Count>
  // <TODO - TXs in Last 30 Days>
}

/* ====================================================================================================================================================== */

// Function to get SNOB market cap:
const getMarketCap = async () => {
  // <TODO>
}

/* ====================================================================================================================================================== */

// Function to get total SNOB supply:
const getTotalSupply = async () => {
  let contract = new ethers.Contract(config.snob, config.minABI, avax);
  let supply = ((await contract.totalSupply()) / (10**18)).toFixed(2);
  return supply;
}

/* ====================================================================================================================================================== */

// Function to get SNOB in treasury:
const getTreasuryBalance = async () => {
  // <TODO>
}

/* ====================================================================================================================================================== */

// Function to get staked SNOB supply:
const getStaked = async () => {
  // <TODO>
}

/* ====================================================================================================================================================== */

// Function to get circulating SNOB supply:
const getCirculating = async () => {
  // <TODO>
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
  // let holders = await getHolders();
  // let txInfo = await getTxs();
  // let marketCap = await getMarketCap();
  let totalSupply = await getTotalSupply();
  // let treasury = await getTreasuryBalance();
  // let staked = await getStaked();
  // let circulating = await getCirculating();
  // let stakers = await getStakers();

  // Printing Data:
  console.log('==============================');
  console.log('||        SNOB Stats        ||');
  console.log('==============================');
  console.log('- SNOB Price:', price);
  console.log('- Total SNOB Supply:', totalSupply);

}

/* ====================================================================================================================================================== */

// Fetching Data:
fetch();
