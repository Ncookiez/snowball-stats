
// Required Packages:
const { ethers } = require('ethers');
const axios = require('axios');

// Required Config Variables:
const config = require('./config.js');

// Setting Up RPCs:
const avax = new ethers.providers.JsonRpcProvider(config.rpc);
const avax_backup = new ethers.providers.JsonRpcProvider(config.rpc_backup);

// Setting Current Time:
const time = Math.round(Date.now() / 1000);

// Setting Up Optional Args:
let basic = false;
const args = process.argv.slice(2);
if(args.length > 0) {
  if(args[0] === 'basic') {
    basic = true;
  }
}

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
  return supply / (10 ** 18);
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
  return treasuryBalance / (10 ** 18);
}

/* ====================================================================================================================================================== */

// Function to get staked SNOB supply:
const getStaked = async () => {
  let contract = new ethers.Contract(config.snob, config.minABI, avax);
  let balance = parseInt(await contract.balanceOf(config.xsnob));
  console.log('Locked supply loaded...');
  return balance / (10 ** 18);
}

/* ====================================================================================================================================================== */

// Function to get circulating SNOB supply:
const getCirculatingSupply = async (total, treasury, staked) => {
  let contract = new ethers.Contract(config.snob, config.minABI, avax);
  let devFundBalance = parseInt(await contract.balanceOf(config.devFund));
  let circulatingSupply = total - treasury - staked - (devFundBalance / (10 ** 18));
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
    try {
      let query = 'https://api.covalenthq.com/v1/43114/address/' + config.xsnob + '/transactions_v2/?no-logs=true&page-size=1000&page-number=' + page++ + '&key=' + config.ckey;
      let result = await axios.get(query);
      if(!result.data.error) {
        hasNextPage = result.data.data.pagination.has_more;
        let promises = result.data.data.items.map(tx => (async () => {
          if(tx.successful && tx.from_address.toLowerCase() != config.xsnob.toLowerCase() && !wallets.includes(tx.from_address)) {
            wallets.push(tx.from_address);
            try {
              let stake = await contract.locked(tx.from_address);
              let amount = parseInt(stake.amount) / (10 ** 18);
              let unlock = parseInt(stake.end);
              if(amount > 0) {
                stakerInfo.push({ wallet: tx.from_address, amount, unlock });
              }
            } catch {
              try {
                let contract = new ethers.Contract(config.xsnob, config.xsnobABI, avax_backup);
                let stake = await contract.locked(tx.from_address);
                let amount = parseInt(stake.amount) / (10 ** 18);
                let unlock = parseInt(stake.end);
                if(amount > 0) {
                  stakerInfo.push({ wallet: tx.from_address, amount, unlock });
                }
              } catch {
                console.log('RPC ERROR: Call Rejected - Could not fetch xSNOB info for', tx.from_address);
              }
            }
          }
        })());
        await Promise.all(promises);
        console.log(`xSNOB info loaded... (Page ${page})`);
      } else {
        hasNextPage = false;
      }
    } catch {
      console.log('API ERROR: Covalent is likely down.');
      hasNextPage = false;
    }
  } while(hasNextPage);
  return stakerInfo;
}

/* ====================================================================================================================================================== */

// Function to get total xSNOB supply:
const getOutputSupply = async () => {
  let contract = new ethers.Contract(config.xsnob, config.xsnobABI, avax);
  let supply = parseInt(await contract.totalSupply());
  console.log('Total xSNOB Supply loaded...');
  return supply / (10 ** 18);
}

/* ====================================================================================================================================================== */

// Function to get # of SNOB stakers:
const getStakers = (info) => {
  let stakers = info.filter(stake => stake.unlock > time);
  return stakers.length;
}

/* ====================================================================================================================================================== */

// Function to get average SNOB locked amount:
const getAvgLockedAmount = (info) => {
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
const getAvgLockedTime = (snob, xsnob) => {
  let avgLockedTime = (xsnob / snob) * 2;
  return avgLockedTime;
}

/* ====================================================================================================================================================== */

// Function to get average xSNOB amount held by stakers:
const getAvgOutputAmount = (avgAmount, avgTime) => {
  let avgOutput = avgAmount * (avgTime / 2);
  return avgOutput;
}

/* ====================================================================================================================================================== */

// Function to get number of stakers with 50k+ xSNOB:
const getNumStakers50k = (info) => {
  let stakers = info.filter(stake => (stake.amount * ((stake.unlock - time) / 60 / 60 / 24 / 365 / 2)) > 50000);
  return stakers.length;
}

/* ====================================================================================================================================================== */

// Function to get number of stakers with unlocked SNOB still in contract:
const getForgetfulStakers = (info) => {
  let stakers = info.filter(stake => stake.unlock < time);
  return stakers.length;
}

/* ====================================================================================================================================================== */

// Function to get amount of unlocked SNOB still in contract:
const getForgottenStakes = (info) => {
  let stakers = info.filter(stake => stake.unlock < time);
  let amountForgotten = 0;
  stakers.forEach(stake => {
    amountForgotten += stake.amount;
  });
  return amountForgotten;
}

/* ====================================================================================================================================================== */

// Function to get amount of SNOB left unclaimed in xSNOB staking contract:
const getUnclaimedSNOB = async () => {
  let contract = new ethers.Contract(config.snob, config.minABI, avax);
  let unclaimedSNOB = parseInt(await contract.balanceOf(config.feeDistributor));
  console.log('Unclaimed SNOB Distribution loaded...');
  return unclaimedSNOB / (10 ** 18);
}

/* ====================================================================================================================================================== */

// Function to get amount of AXIAL left unclaimed in xSNOB staking contract:
const getUnclaimedAXIAL = async () => {
  let contract = new ethers.Contract(config.axial, config.minABI, avax);
  let unclaimedAXIAL = parseInt(await contract.balanceOf(config.axialFeeDistributor));
  console.log('Unclaimed AXIAL Distribution loaded...');
  return unclaimedAXIAL / (10 ** 18);
}

/* ====================================================================================================================================================== */

// Function to get top 5 richest xSNOB holders:
const getRichList = (info) => {
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

// Function to get voter info:
const getVoterInfo = async () => {
  let wallets = [];
  let votes = 0;
  let page_1 = 0;
  let hasNextPage = false;
  do {
    let query = 'https://api.covalenthq.com/v1/43114/address/' + config.gaugeProxy + '/transactions_v2/?no-logs=true&page-size=1000&page-number=' + page_1++ + '&key=' + config.ckey;
    let result = await axios.get(query);
    if(!result.data.error) {
      hasNextPage = result.data.data.pagination.has_more;
      let promises = result.data.data.items.map(tx => (async () => {
        if(tx.successful && tx.from_address.toLowerCase() != config.gaugeProxy.toLowerCase() && tx.from_address.toLowerCase() != config.operations.toLowerCase() && tx.from_address.toLowerCase() != '0xc9a51fB9057380494262fd291aED74317332C0a2'.toLowerCase()) {
          if(!wallets.includes(tx.from_address)) {
            wallets.push(tx.from_address);
          }
          votes++;
        }
      })());
      await Promise.all(promises);
      console.log(`Voter info loaded... (Page ${page_1})`);
    } else {
      hasNextPage = false;
    }
  } while(hasNextPage);
  let page_2 = 0;
  hasNextPage = false;
  do {
    let query = 'https://api.covalenthq.com/v1/43114/address/' + config.oldGaugeProxy + '/transactions_v2/?no-logs=true&page-size=1000&page-number=' + page_2++ + '&key=' + config.ckey;
    let result = await axios.get(query);
    if(!result.data.error) {
      hasNextPage = result.data.data.pagination.has_more;
      let promises = result.data.data.items.map(tx => (async () => {
        if(tx.successful && tx.from_address.toLowerCase() != config.oldGaugeProxy.toLowerCase() && tx.from_address.toLowerCase() != config.operations.toLowerCase() && tx.from_address.toLowerCase() != '0xc9a51fB9057380494262fd291aED74317332C0a2'.toLowerCase()) {
          if(!wallets.includes(tx.from_address)) {
            wallets.push(tx.from_address);
          }
          votes++;
        }
      })());
      await Promise.all(promises);
      console.log(`Voter info loaded... (Page ${page_1 + page_2})`);
    } else {
      hasNextPage = false;
    }
  } while(hasNextPage);
  return {voters: wallets, votes};
}

/* ====================================================================================================================================================== */

// Function to get number of current stakers that have voted:
const getStakingVoters = (voterInfo, stakerInfo) => {
  let stakers = stakerInfo.filter(stake => stake.unlock > time);
  let numStakingVoters = 0;
  stakers.forEach(stake => {
    if(voterInfo.voters.includes(stake.wallet)) {
      numStakingVoters++;
    }
  });
  return numStakingVoters;
}

/* ====================================================================================================================================================== */

// Function to fetch all stats:
const fetch = async () => {

  // Full Data:
  if(!basic) {

    // Fetching Data:
    let price = await getPrice();
    let totalSupply = await getTotalSupply();
    let holders = await getHolders();
    let treasuryBalance = await getTreasuryBalance();
    let staked = await getStaked();
    let circulatingSupply = await getCirculatingSupply(totalSupply, treasuryBalance, staked);
    let outputSupply = await getOutputSupply();
    let stakerInfo = await getStakerInfo();
    let voterInfo = await getVoterInfo();
    let unclaimedSNOB = await getUnclaimedSNOB();
    let unclaimedAXIAL = await getUnclaimedAXIAL();
    let numStakers = getStakers(stakerInfo);
    let avgLockedAmount = getAvgLockedAmount(stakerInfo);
    let avgLockedTime = getAvgLockedTime(staked, outputSupply);
    let avgOutputAmount = getAvgOutputAmount(avgLockedAmount, avgLockedTime);
    let numStakers50k = getNumStakers50k(stakerInfo);
    let forgetfulStakers = getForgetfulStakers(stakerInfo);
    let forgottenStakes = getForgottenStakes(stakerInfo);
    let richList = getRichList(stakerInfo);
    let currentStakingVotes = getStakingVoters(voterInfo, stakerInfo);

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
    console.log('  - xSNOB Holders w/ 50k+:', numStakers50k.toLocaleString(undefined, {maximumFractionDigits: 0}), 'Users');
    console.log('  - Forgetful xSNOB Holders:', forgetfulStakers.toLocaleString(undefined, {maximumFractionDigits: 0}), 'Users');
    console.log('  - SNOB Forgotten:', forgottenStakes.toLocaleString(undefined, {maximumFractionDigits: 0}), 'SNOB');
    console.log('  - Unclaimed SNOB (From xSNOB):', unclaimedSNOB.toLocaleString(undefined, {maximumFractionDigits: 0}), 'SNOB');
    console.log('  - Unclaimed AXIAL (From xSNOB):', unclaimedAXIAL.toLocaleString(undefined, {maximumFractionDigits: 0}), 'AXIAL');
    console.log('  - Top 5 xSNOB Holders:');
    richList.forEach(user => {
      console.log('      >', user.wallet, '-', user.xsnob.toLocaleString(undefined, {maximumFractionDigits: 0}), 'xSNOB (' + ((user.xsnob / outputSupply) * 100).toFixed(2) + '% of possible votes)');
    });
    console.log('  - Allocation Voters:', voterInfo.voters.length.toLocaleString(undefined, {maximumFractionDigits: 0}), 'Users');
    console.log('  - Total Allocation Votes:', voterInfo.votes.toLocaleString(undefined, {maximumFractionDigits: 0}), 'Votes');
    console.log('  - % of Current Stakers Voted:', ((currentStakingVotes / numStakers) * 100).toFixed(2) + '%');

  // Basic Data (Loads Faster):
  } else {

    // Fetching Data:
    let price = await getPrice();
    let totalSupply = await getTotalSupply();
    let treasuryBalance = await getTreasuryBalance();
    let staked = await getStaked();
    let circulatingSupply = await getCirculatingSupply(totalSupply, treasuryBalance, staked);
    let outputSupply = await getOutputSupply();
    let unclaimedSNOB = await getUnclaimedSNOB();
    let unclaimedAXIAL = await getUnclaimedAXIAL();
    let avgLockedTime = getAvgLockedTime(staked, outputSupply);

    // Printing Data:
    console.log('\n  ==============================');
    console.log('  ||        SNOB Stats        ||');
    console.log('  ==============================\n');
    console.log('  - SNOB Price:', '$' + price);
    console.log('  - Total SNOB Supply:', totalSupply.toLocaleString(undefined, {maximumFractionDigits: 0}), 'SNOB');
    console.log('  - SNOB Market Cap:', '$' + (price * totalSupply).toLocaleString(undefined, {maximumFractionDigits: 0}));
    console.log('  - Treasury:', '$' + (price * treasuryBalance).toLocaleString(undefined, {maximumFractionDigits: 0}), '(' + treasuryBalance.toLocaleString(undefined, {maximumFractionDigits: 0}) + ' SNOB)');
    console.log('  - Staked SNOB:', staked.toLocaleString(undefined, {maximumFractionDigits: 0}), 'SNOB (' + ((staked / totalSupply) * 100).toFixed(2) + '% of total supply)');
    console.log('  - Circulating SNOB Supply:', circulatingSupply.toLocaleString(undefined, {maximumFractionDigits: 0}), 'SNOB (' + ((circulatingSupply / totalSupply) * 100).toFixed(2) + '% of total supply)');
    console.log('  - Average SNOB Locked Time:', avgLockedTime.toLocaleString(undefined, {maximumFractionDigits: 2}), 'Years');
    console.log('  - Total xSNOB Supply:', outputSupply.toLocaleString(undefined, {maximumFractionDigits: 0}), 'xSNOB');
    console.log('  - Unclaimed SNOB (From xSNOB):', unclaimedSNOB.toLocaleString(undefined, {maximumFractionDigits: 0}), 'SNOB');
    console.log('  - Unclaimed AXIAL (From xSNOB):', unclaimedAXIAL.toLocaleString(undefined, {maximumFractionDigits: 0}), 'AXIAL');
  }
}

/* ====================================================================================================================================================== */

// Fetching Data:
fetch();
