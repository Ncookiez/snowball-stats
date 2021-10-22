
// Required Packages:
const { ethers } = require('ethers');
const axios = require('axios');

// Required Config & Parameter Variables:
const config = require('./config.js');
const args = process.argv.slice(2);

/* ====================================================================================================================================================== */

// Function to get SNOB Price:
const getPrice = async () => {
  let query = 'https://api.coingecko.com/api/v3/simple/token_price/avalanche?contract_addresses=' + config.snob + '&vs_currencies=usd';
  let result = await axios.get(query);
  let price = result.data[config.snob.toLowerCase()].usd;
  console.log('- SNOB Price:', price.toFixed(4));
}

/* ====================================================================================================================================================== */

// Getting SNOB Supply:
// <TODO>

/* ====================================================================================================================================================== */

// Getting # of Unique Wallets Holding SNOB:
// <TODO>

/* ====================================================================================================================================================== */

// Printing Title:
console.log('==============================');
console.log('||        SNOB Stats        ||');
console.log('==============================');

// Running Functions:
getPrice();