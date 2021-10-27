
// Required Packages:
const { ethers } = require('ethers');
const axios = require('axios');

// Required Config Variables & Arguments:
const config = require('./config.js');
const args = process.argv.slice(2);

// Setting Up RPC:
const avax = new ethers.providers.JsonRpcProvider(config.rpc);

// Setting Current Time:
const time = Math.round(Date.now() / 1000);

/* ====================================================================================================================================================== */

// Function to get total, monthly and time-specific user info:
const getUserInfo = async () => {
  let done = 0;
  let allWallets = [];
  let monthlyWallets = [];
  let timeSpecificWallets = [];
  let gauges = await getGauges();
  for(let i = 0; i < gauges.length; i++) {
  // let promises = gauges.map(gauge => (async () => {
    let txs = await getTransactions(gauges[i]);
    if(txs) {
      txs.forEach(async (tx) => {
  
        // All Wallets:
        if(!allWallets.includes(tx.wallet)) {
          allWallets.push(tx.wallet);
        }
  
        // Wallets Active In Last 30 Days:
        if(!monthlyWallets.includes(tx.wallet) && tx.time > (time - 2592000)) {
          monthlyWallets.push(tx.wallet);
        }
  
        // Wallets Active In Specified Time Period:
        // <TODO>
      });
      console.log(`User info loaded... (${++done}/${gauges.length})`);
    }
  }
  // })());
  // await Promise.all(promises);
  return {all: allWallets.length, monthly: monthlyWallets.length, timeSpecific: timeSpecificWallets.length};
}

/* ====================================================================================================================================================== */

// Function to get all gauges:
const getGauges = async () => {
  let contract = new ethers.Contract(config.gaugeProxy, config.gaugeProxyABI, avax);
  let tokens = await contract.tokens();
  let gauges = [];
  let gauge_promises = tokens.map(token => (async () => {
    try {
      let gauge = await contract.getGauge(token);
      if(gauge != '0x0000000000000000000000000000000000000000') {
        gauges.push(gauge);
      } else {
        console.log('CONTRACT ERROR: getGauge() has returned 0x00 for token', token);
      }
    } catch {
      console.log('RPC ERROR: Call Rejected - Could not get gauge for', token);
    }
  })());
  await Promise.all(gauge_promises);
  console.log('Gauges fetched...');
  return gauges;
}

/* ====================================================================================================================================================== */

// Function to get gauge transaction history:
const getTransactions = async (gauge) => {
  let txs = [];
  let page = 0;
  let hasNextPage = false;
  try {
    do {
      let query = 'https://api.covalenthq.com/v1/43114/address/' + gauge + '/transactions_v2/?page-size=1000&page-number=' + page++ + '&key=' + config.ckey;
      let result = await axios.get(query);
      if(!result.data.error) {
        hasNextPage = result.data.data.pagination.has_more;
        result.data.data.items.forEach(async (tx) => {
          if(tx.successful && tx.from_address.toLowerCase() != gauge.toLowerCase()) {
            txs.push({ wallet: tx.from_address, time: (new Date(tx.block_signed_at)).getTime() / 1000 });
          }
        });
      } else {
        hasNextPage = false;
      }
    } while(hasNextPage);
  } catch {
    console.log('API ERROR: Call Rejected - Could not get user info for', gauge);
  }
  return txs;
}

/* ====================================================================================================================================================== */

// Function to fetch all stats:
const fetch = async () => {

  // Fetching Data:
  let userInfo = await getUserInfo();

  // Printing Data:
  console.log('\n  ==============================');
  console.log('  ||     Compounder Stats     ||');
  console.log('  ==============================\n');
  console.log('  - All-Time:', userInfo.all.toLocaleString(undefined, {maximumFractionDigits: 0}), 'Users');
  console.log('  - Monthly:', userInfo.monthly.toLocaleString(undefined, {maximumFractionDigits: 0}), 'Users');

}

/* ====================================================================================================================================================== */

// Fetching Data:
fetch();
