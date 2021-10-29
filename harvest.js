
// Required Packages:
const { ethers } = require('ethers');
const axios = require('axios');

// Required Config Variables:
const config = require('./config.js');

// Setting Up RPC:
const avax = new ethers.providers.JsonRpcProvider(config.rpc);

// Setting Current Time:
const time = Math.round(Date.now() / 1000);

/* ====================================================================================================================================================== */

// Function to get all gauges:
// const getGauges = async () => {
//   let contract = new ethers.Contract(config.gaugeProxy, config.gaugeProxyABI, avax);
//   let tokens = await contract.tokens();
//   let gauges = [];
//   let gauge_promises = tokens.map(token => (async () => {
//     try {
//       let gauge = await contract.getGauge(token);
//       if(gauge != '0x0000000000000000000000000000000000000000') {
//         gauges.push(gauge);
//       } else {
//         console.log('CONTRACT ERROR: getGauge() has returned 0x00 for token', token);
//       }
//     } catch {
//       console.log('RPC ERROR: Call Rejected - Could not get gauge for', token);
//     }
//   })());
//   await Promise.all(gauge_promises);
//   console.log('Gauges fetched...');
//   return gauges;
// }

/* ====================================================================================================================================================== */

// Function to fetch all stats:
const fetch = async () => {

  // Fetching Data:
  // let txs = await getTransactionInfo();

  // Printing Data:
  console.log('\n  ==============================');
  console.log('  ||     Compounder Stats     ||');
  console.log('  ==============================\n');
  // console.log('  - All-Time:', users.toLocaleString(undefined, {maximumFractionDigits: 0}), 'Users');
}

/* ====================================================================================================================================================== */

// Fetching Data:
fetch();
