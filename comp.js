
// Required Packages:
const { ethers } = require('ethers');
const axios = require('axios');

// Required Config & Parameter Variables:
const config = require('./config.js');
const args = process.argv.slice(2);

// Setting Up RPC:
const avax = new ethers.providers.JsonRpcProvider(config.rpc);

/* ====================================================================================================================================================== */

// Function to get # of unique users:
const getTotalUsers = async () => {
  // <TODO>
}

/* ====================================================================================================================================================== */

// Function to get # of unique users in the last 30 days:
const getMonthlyUsers = async () => {
  // <TODO>
}

/* ====================================================================================================================================================== */

// Function to get # of unique users in any specific period of time:
const getTimeSpecificUsers = async () => {
  // <TODO>
}

/* ====================================================================================================================================================== */

// Function to fetch all stats:
const fetch = async () => {

  // Fetching Data:
  // let totalUsers = await getTotalUsers();
  // let monthlyUsers = await getMonthlyUsers();
  // let timeSpecificUsers = await getTimeSpecificUsers();

  // Printing Data:
  console.log('==============================');
  console.log('||     Compounder Stats     ||');
  console.log('==============================');
  console.log('None for now.')

}

/* ====================================================================================================================================================== */

// Fetching Data:
fetch();
