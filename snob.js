
// Required Packages:
const { ethers } = require('ethers');
const axios = require('axios');

// Required Config & Parameter Variables:
const config = require('./config.js');

// Setting Up RPC:
const avax = new ethers.providers.JsonRpcProvider(config.rpc);

// Setting Current Time:
const time = Math.round(Date.now() / 1000);

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
  let contract = new ethers.Contract(config.snob, config.minABI, avax);
  let treasuryBalance = parseInt(await contract.balanceOf(config.treasury));
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

// Function to get circulating SNOB supply:
const getCirculatingSupply = async (total, treasury, staked) => {
  let contract = new ethers.Contract(config.snob, config.minABI, avax);
  let devFundBalance = parseInt(await contract.balanceOf(config.devFund));
  let circulatingSupply = total - treasury - staked - (devFundBalance / (10**18));
  return circulatingSupply;
}

/* ====================================================================================================================================================== */

// Function to get SNOB staker info:
const getStakerInfo = async () => {
  let contract = new ethers.Contract(config.xsnob, config.xsnobABI, avax);
  let wallets = [];
  let stakerInfo = [];
  let page = 0;
  let hasNextPage = false;
  try {
    do {
      let query = 'https://api.covalenthq.com/v1/43114/address/' + config.xsnob + '/transactions_v2/?page-size=1000&page-number=' + page++ + '&key=' + config.ckey;
      let result = await axios.get(query);
      if(!result.data.error) {
        hasNextPage = result.data.data.pagination.has_more;
        result.data.data.items.forEach(async (tx) => {
          if(tx.successful && tx.from_address.toLowerCase() != config.xsnob.toLowerCase() && !wallets.includes(tx.from_address)) {
            wallets.push(tx.from_address);
            let stake = await contract.locked(tx.from_address);
            let amount = parseInt(stake.amount) / (10**18);
            let unlock = parseInt(stake.end);
            if(amount > 0) {
              stakerInfo.push({ wallet: tx.from_address, amount, unlock });
            }
          }
        });
      } else {
        hasNextPage = false;
      }
    } while(hasNextPage);
  } catch {
    console.log('Error: Likely RPC-Related. Wait a bit before retrying.');
  }
  return stakerInfo;
}

/* ====================================================================================================================================================== */

// Function to get # of SNOB stakers:
const getStakers = async (info) => {
  let stakers = info.filter(stake => stake.unlock > time);
  return stakers.length;
}

/* ====================================================================================================================================================== */

// Function to get average SNOB locked amount:
const getAvgLockedAmount = async (info) => {
  let stakers = info.filter(stake => stake.unlock > time);
  let sum = 0;
  stakers.forEach(stake => {
    sum += stake.amount;
  });
  let avgAmount = sum / stakers.length;
  return avgAmount;
}

/* ====================================================================================================================================================== */

// Function to get average SNOB locked time:
const getAvgLockedTime = async (info) => {
  let stakers = info.filter(stake => stake.unlock > time);
  let sum = 0;
  stakers.forEach(stake => {
    sum += (stake.unlock - time);
  });
  let avgLockedTime = sum / stakers.length / 60 / 60 / 24 / 365;
  return avgLockedTime;
}

/* ====================================================================================================================================================== */

// Function to get average xSNOB amount held by stakers:
const getAvgOutputAmount = async (avgAmount, avgTime) => {
  let avgOutput = avgAmount * (avgTime / 2);
  return avgOutput;
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
  let circulatingSupply = await getCirculatingSupply(totalSupply, treasuryBalance, staked);
  let stakerInfo = await getStakerInfo();
  let numStakers = await getStakers(stakerInfo);
  let avgLockedAmount = await getAvgLockedAmount(stakerInfo);
  let avgLockedTime = await getAvgLockedTime(stakerInfo);
  let avgOutputAmount = await getAvgOutputAmount(avgLockedAmount, avgLockedTime);
  let avgScaledLockedTime = await getAvgScaledLockedTime(stakerInfo);

  // Printing Data:
  console.log('  ==============================');
  console.log('  ||        SNOB Stats        ||');
  console.log('  ==============================\n');
  console.log('  - SNOB Price:', '$' + price);
  console.log('  - Total SNOB Supply:', totalSupply.toLocaleString(undefined, {maximumFractionDigits: 0}), 'SNOB');
  console.log('  - SNOB Market Cap:', '$' + (price * totalSupply).toLocaleString(undefined, {maximumFractionDigits: 0}));
  console.log('  - SNOB Holders:', holders.toLocaleString(undefined, {maximumFractionDigits: 0}), 'Users');
  console.log('  - Treasury:', '$' + (price * treasuryBalance).toLocaleString(undefined, {maximumFractionDigits: 0}), '(' + treasuryBalance.toLocaleString(undefined, {maximumFractionDigits: 0}) + ' SNOB)');
  console.log('  - Staked SNOB:', staked.toLocaleString(undefined, {maximumFractionDigits: 0}), 'SNOB (' + ((staked / totalSupply) * 100).toFixed(2) + '% of total supply)');
  console.log('  - Circulating SNOB Supply:', circulatingSupply.toLocaleString(undefined, {maximumFractionDigits: 0}), 'SNOB (' + ((circulatingSupply / totalSupply) * 100).toFixed(2) + '% of total supply)');
  console.log('  - xSNOB Holders:', numStakers.toLocaleString(undefined, {maximumFractionDigits: 0}), 'Users');
  console.log('  - Average SNOB Amount Staked:', avgLockedAmount.toLocaleString(undefined, {maximumFractionDigits: 0}), 'SNOB');
  console.log('  - Average SNOB Locked Time:', avgLockedTime.toLocaleString(undefined, {maximumFractionDigits: 2}), 'Years');
  console.log('  - Average xSNOB Amount Held:', avgOutputAmount.toLocaleString(undefined, {maximumFractionDigits: 0}), 'xSNOB');

}

/* ====================================================================================================================================================== */

// Fetching Data:
fetch();
