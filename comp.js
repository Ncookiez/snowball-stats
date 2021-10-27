
// Required Packages:
const { ethers } = require('ethers');
const axios = require('axios');

// Required Config Variables:
const config = require('./config.js');

// Setting Up RPC:
const avax = new ethers.providers.JsonRpcProvider(config.rpc);

// Setting Current Time:
const time = Math.round(Date.now() / 1000);

// Setting Up Optional Args:
const args = process.argv.slice(2);
let timeControls = false;
let minTime = 0;
let maxTime = 0;
if(args.length > 0) {
  try {
    minTime = parseInt(args[0]);
    if(!isNaN(minTime)) {
      timeControls = true;
    }
    maxTime = parseInt(args[1]);
    if(isNaN(maxTime)) {
      maxTime = time;
    }
  } catch {
    console.log('ERROR: Invalid Arguments');
  }
}

/* ====================================================================================================================================================== */

// Function to get transaction info:
const getTransactionInfo = async () => {
  let transactions = [];
  let gauges = await getGauges();
  for(let i = 0; i < gauges.length; i++) {
    let txs = await getTXs(gauges[i]);
    while(txs === null) {
      console.log('Retrying...');
      txs = await getTXs(gauges[i]);
    }
    transactions = [...transactions, ...txs];
    console.log(`Transactions loaded... (${i + 1}/${gauges.length})`);
  }
  return transactions;
}

/* ====================================================================================================================================================== */

// Function to get all gauges:
const getGauges = async () => {
  let contract = new ethers.Contract(config.gaugeProxy, config.gaugeProxyABI, avax);
  let tokens = await contract.tokens();
  let gauges = [];
  let gauge_promises = tokens.slice(0, 2).map(token => (async () => {
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
const getTXs = async (gauge) => {
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
            txs.push({ gauge, wallet: tx.from_address, time: (new Date(tx.block_signed_at)).getTime() / 1000 });
          }
        });
      } else {
        hasNextPage = false;
      }
    } while(hasNextPage);
  } catch {
    console.log('API ERROR: Call Rejected - Could not get user info for', gauge);
    return null;
  }
  return txs;
}

/* ====================================================================================================================================================== */

// Function to get all-time unique users:
const getUniqueUsers = async (txs) => {
  let users = [];
  let promises = txs.map(tx => (async () => {
    if(!users.includes(tx.wallet)) {
      users.push(tx.wallet);
    }
  })());
  await Promise.all(promises);
  return users.length;
}

/* ====================================================================================================================================================== */

// Function to get monthly unique users:
const getMonthlyUniqueUsers = async (txs) => {
  let users = [];
  let promises = txs.map(tx => (async () => {
    if(!users.includes(tx.wallet) && tx.time > (time - 2592000)) {
      users.push(tx.wallet);
    }
  })());
  await Promise.all(promises);
  return users.length;
}

/* ====================================================================================================================================================== */

// Function to get time-specific unique users:
const getTimeSpecificUniqueUsers = async (txs) => {
  let users = [];
  let promises = txs.map(tx => (async () => {
    if(!users.includes(tx.wallet) && tx.time > minTime && tx.time < maxTime) {
      users.push(tx.wallet);
    }
  })());
  await Promise.all(promises);
  return users.length;
}

/* ====================================================================================================================================================== */

// Function to fetch all stats:
const fetch = async () => {

  // Fetching Data:
  let txs = await getTransactionInfo();
  let users = await getUniqueUsers(txs);
  let monthlyUsers = await getMonthlyUniqueUsers(txs);
  let timedUsers = 0;
  if(timeControls) {
    timedUsers = await getTimeSpecificUniqueUsers(txs);
  }

  // Printing Data:
  console.log('\n  ==============================');
  console.log('  ||     Compounder Stats     ||');
  console.log('  ==============================\n');
  console.log('  - All-Time:', users.toLocaleString(undefined, {maximumFractionDigits: 0}), 'Users');
  console.log('  - Monthly:', monthlyUsers.toLocaleString(undefined, {maximumFractionDigits: 0}), 'Users');
  if(timeControls) {
    console.log('  - Specified Time Period:', timedUsers.toLocaleString(undefined, {maximumFractionDigits: 0}), 'Users');
  }
}

/* ====================================================================================================================================================== */

// Fetching Data:
fetch();
