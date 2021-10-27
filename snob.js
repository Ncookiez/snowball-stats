
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

// Function to get SNOB Price:
const getPrice = async () => {
  let query = 'https://api.coingecko.com/api/v3/simple/token_price/avalanche?contract_addresses=' + config.snob + '&vs_currencies=usd';
  let result = await axios.get(query);
  let price = result.data[config.snob.toLowerCase()].usd.toFixed(4);
  console.log('Price loaded...');
  return price;
}

/* ====================================================================================================================================================== */

// Function to get total SNOB supply:
const getTotalSupply = async () => {
  let contract = new ethers.Contract(config.snob, config.minABI, avax);
  let supply = await contract.totalSupply();
  console.log('Total supply loaded...');
  return supply / (10**18);
}

/* ====================================================================================================================================================== */

// Function to get # of SNOB holders:
const getHolders = async () => {
  let query = 'https://api.covalenthq.com/v1/43114/tokens/' + config.snob + '/token_holders/?page-size=50000&key=' + config.ckey;
  let result = await axios.get(query);
  let holders = result.data.data.items.length;
  console.log('Holders loaded...');
  return holders;
}

/* ====================================================================================================================================================== */

// Function to get SNOB in treasury:
const getTreasuryBalance = async () => {
  let contract = new ethers.Contract(config.snob, config.minABI, avax);
  let treasuryBalance = parseInt(await contract.balanceOf(config.treasury));
  console.log('Treasury balance loaded...');
  return treasuryBalance / (10**18);
}

/* ====================================================================================================================================================== */

// Function to get staked SNOB supply:
const getStaked = async () => {
  let contract = new ethers.Contract(config.snob, config.minABI, avax);
  let balance = parseInt(await contract.balanceOf(config.xsnob));
  console.log('Locked supply loaded...');
  return balance / (10**18);
}

/* ====================================================================================================================================================== */

// Function to get circulating SNOB supply:
const getCirculatingSupply = async (total, treasury, staked) => {
  let contract = new ethers.Contract(config.snob, config.minABI, avax);
  let devFundBalance = parseInt(await contract.balanceOf(config.devFund));
  let circulatingSupply = total - treasury - staked - (devFundBalance / (10**18));
  console.log('Circulating supply loaded...');
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
  do {
    let query = 'https://api.covalenthq.com/v1/43114/address/' + config.xsnob + '/transactions_v2/?page-size=1000&page-number=' + page++ + '&key=' + config.ckey;
    let result = await axios.get(query);
    if(!result.data.error) {
      hasNextPage = result.data.data.pagination.has_more;
      let promises = result.data.data.items.map(tx => (async () => {
        if(tx.successful && tx.from_address.toLowerCase() != config.xsnob.toLowerCase() && !wallets.includes(tx.from_address)) {
          wallets.push(tx.from_address);
          try {
            let stake = await contract.locked(tx.from_address);
            let amount = parseInt(stake.amount) / (10**18);
            let unlock = parseInt(stake.end);
            if(amount > 0) {
              stakerInfo.push({ wallet: tx.from_address, amount, unlock });
            }
          } catch {
            console.log('RPC ERROR: Call Rejected - Could not fetch xSNOB info for', tx.from_address);
          }
        }
      })());
      await Promise.all(promises);
      console.log(`xSNOB info loaded... (Page ${page})`);
    } else {
      hasNextPage = false;
    }
  } while(hasNextPage);
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

// Function to get total xSNOB supply:
const getOutputSupply = async (numStakers, avgAmount, avgTime) => {
  let supply = numStakers * (avgAmount * (avgTime / 2));
  return supply;
}

/* ====================================================================================================================================================== */

// Function to get average xSNOB amount held by stakers:
const getAvgOutputAmount = async (avgAmount, avgTime) => {
  let avgOutput = avgAmount * (avgTime / 2);
  return avgOutput;
}

/* ====================================================================================================================================================== */

// Function to get number of stakers with 100k+ xSNOB:
const getNumStakers100k = async (info) => {
  let stakers = info.filter(stake => (stake.amount * ((stake.unlock - time) / 60 / 60 / 24 / 365 / 2)) > 100000);
  return stakers.length;
}

/* ====================================================================================================================================================== */

// Function to get number of stakers with unlocked SNOB still in contract:
const getForgetfulStakers = async (info) => {
  let stakers = info.filter(stake => stake.unlock < time);
  return stakers.length;
}

/* ====================================================================================================================================================== */

// Function to get amount of unlocked SNOB still in contract:
const getForgottenStakes = async (info) => {
  let stakers = info.filter(stake => stake.unlock < time);
  let amountForgotten = 0;
  stakers.forEach(stake => {
    amountForgotten += stake.amount;
  });
  return amountForgotten;
}

/* ====================================================================================================================================================== */

// Function to get top 5 richest xSNOB holders:
const getRichList = async (info) => {
  let oldStakers = info.filter(stake => stake.unlock > time);
  let stakers = [];
  oldStakers.forEach(stake => {
    let xsnob = stake.amount * ((stake.unlock - time) / 60 / 60 / 24 / 365 / 2);
    stakers.push({ wallet: stake.wallet, xsnob });
  });
  stakers.sort((a, b) => b.xsnob - a.xsnob);
  return stakers.slice(0, 5);
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
  let outputSupply = await getOutputSupply(numStakers, avgLockedAmount, avgLockedTime);
  let avgOutputAmount = await getAvgOutputAmount(avgLockedAmount, avgLockedTime);
  let numStakers100k = await getNumStakers100k(stakerInfo);
  let forgetfulStakers = await getForgetfulStakers(stakerInfo);
  let forgottenStakes = await getForgottenStakes(stakerInfo);
  let richList = await getRichList(stakerInfo);

  // Printing Data:
  console.log('\n  ==============================');
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
  console.log('  - Total xSNOB Supply:', outputSupply.toLocaleString(undefined, {maximumFractionDigits: 0}), 'xSNOB');
  console.log('  - Average xSNOB Amount Held:', avgOutputAmount.toLocaleString(undefined, {maximumFractionDigits: 0}), 'xSNOB');
  console.log('  - xSNOB Holders w/ 100k+:', numStakers100k.toLocaleString(undefined, {maximumFractionDigits: 0}), 'Users');
  console.log('  - Forgetful xSNOB Holders:', forgetfulStakers.toLocaleString(undefined, {maximumFractionDigits: 0}), 'Users');
  console.log('  - SNOB Forgotten:', forgottenStakes.toLocaleString(undefined, {maximumFractionDigits: 0}), 'SNOB');
  console.log('  - Top 5 xSNOB Holders:');
  richList.forEach(user => {
    console.log('      >', user.wallet, '-', user.xsnob.toLocaleString(undefined, {maximumFractionDigits: 0}), 'xSNOB (' + ((user.xsnob / outputSupply) * 100).toFixed(2) + '% of possible votes)');
  });
}

/* ====================================================================================================================================================== */

// Fetching Data:
fetch();
