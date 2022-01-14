
// Required Packages:
const { ethers } = require('ethers');
const axios = require('axios');

// Required Config Variables:
const config = require('../config.js');

// Setting Up RPCs:
const avax = new ethers.providers.JsonRpcProvider(config.rpc);
const avax_backup = new ethers.providers.JsonRpcProvider(config.rpc_backup);

// Setting Current Time:
const time = Math.round(Date.now() / 1000);

// Setting Block Variables:
const startBlock = 2477000;
const querySize = 100000;

// Setting Up Optional Args:
let basic = false;
const args = process.argv.slice(2);
if(args.length > 0) {
  if(args[0] === 'basic') {
    basic = true;
  }
}

/* ====================================================================================================================================================== */

// Function to make blockchain queries:
const query = async (address, abi, method, args) => {
  let result;
  let errors = 0;
  while(!result) {
    try {
      let contract = new ethers.Contract(address, abi, avax);
      result = await contract[method](...args);
    } catch {
      try {
        let contract = new ethers.Contract(address, abi, avax_backup);
        result = await contract[method](...args);
      } catch {
        if(++errors === 3) {
          console.error(`RPC ERROR: Calling ${method}(${args}) on ${address}.`);
          process.exit(1);
        }
      }
    }
  }
  return result;
}

/* ====================================================================================================================================================== */

// Function to get SNOB Price:
const getPrice = async () => {
  let price = (await axios.get(`https://api.coingecko.com/api/v3/simple/token_price/avalanche?contract_addresses=${config.snob}&vs_currencies=usd`)).data[config.snob.toLowerCase()].usd;
  console.log('Price loaded...');
  return price.toFixed(4);
}

/* ====================================================================================================================================================== */

// Function to get total SNOB supply:
const getTotalSupply = async () => {
  let supply = await query(config.snob, config.minABI, 'totalSupply', []);
  console.log('Total supply loaded...');
  return supply / (10 ** 18);
}

/* ====================================================================================================================================================== */

// Function to get # of SNOB holders:
const getHolders = async () => {
  let holders = (await axios.get(`https://api.covalenthq.com/v1/43114/tokens/${config.snob}/token_holders/?page-size=50000&key=${config.ckey}`)).data.data.items.length;
  console.log('Holders loaded...');
  return holders;
}

/* ====================================================================================================================================================== */

// Function to get SNOB in treasury:
const getTreasuryBalance = async () => {
  let treasuryBalance = parseInt(await query(config.snob, config.minABI, 'balanceOf', [config.treasury]));
  console.log('Treasury balance loaded...');
  return treasuryBalance / (10 ** 18);
}

/* ====================================================================================================================================================== */

// Function to get staked SNOB supply:
const getStaked = async () => {
  let balance = parseInt(await query(config.snob, config.minABI, 'balanceOf', [config.xsnob]));
  console.log('Locked supply loaded...');
  return balance / (10 ** 18);
}

/* ====================================================================================================================================================== */

// Function to get circulating SNOB supply:
const getCirculatingSupply = async (total, treasury, staked) => {
  let devFundBalance = parseInt(await query(config.snob, config.minABI, 'balanceOf', [config.devFund]));
  let circulatingSupply = total - treasury - staked - (devFundBalance / (10 ** 18));
  console.log('Circulating supply loaded...');
  return circulatingSupply;
}

/* ====================================================================================================================================================== */

// Function to get SNOB staker info:
const getStakerInfo = async () => {
  let wallets = [];
  let stakerInfo = [];
  let page = 0;
  let hasNextPage = false;
  do {
    try {
      let result = await axios.get(`https://api.covalenthq.com/v1/43114/address/${config.xsnob}/transactions_v2/?no-logs=true&page-size=1000&page-number=${page++}&key=${config.ckey}`);
      if(!result.data.error) {
        hasNextPage = result.data.data.pagination.has_more;
        let promises = result.data.data.items.map(tx => (async () => {
          if(tx.successful && tx.from_address.toLowerCase() != config.xsnob.toLowerCase() && !wallets.includes(tx.from_address)) {
            wallets.push(tx.from_address);
            let stake = await query(config.xsnob, config.xsnobABI, 'locked', [tx.from_address]);
            let amount = parseInt(stake.amount) / (10 ** 18);
            let unlock = parseInt(stake.end);
            if(amount > 0) {
              stakerInfo.push({ wallet: tx.from_address, amount, unlock });
            }
          }
        })());
        await Promise.all(promises);
        console.log(`xSNOB info loaded... (Page ${page})`);
      } else {
        hasNextPage = false;
        console.error('API ERROR: Covalent returned an error response.');
        process.exit(1);
      }
    } catch {
      hasNextPage = false;
      console.error('API ERROR: Covalent is likely down.');
      process.exit(1);
    }
  } while(hasNextPage);
  return stakerInfo;
}

/* ====================================================================================================================================================== */

// Function to get total xSNOB supply:
const getOutputSupply = async () => {
  let supply = parseInt(await query(config.xsnob, config.minABI, 'totalSupply', []));
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

// Function to get amount of SNOB left unclaimed for xSNOB stakers:
const getUnclaimedSNOB = async () => {
  let unclaimedSNOB = parseInt(await query(config.snob, config.minABI, 'balanceOf', [config.feeDistributor]));
  console.log('Unclaimed SNOB Distribution loaded...');
  return unclaimedSNOB / (10 ** 18);
}

/* ====================================================================================================================================================== */

// Function to get amount of AXIAL left unclaimed for xSNOB stakers:
const getUnclaimedAXIAL = async () => {
  let unclaimedAXIAL = parseInt(await query(config.axial, config.minABI, 'balanceOf', [config.axialFeeDistributor]));
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

// Function to get gauge allocation voter info:
const getGaugeVoterInfo = async () => {
  let wallets = [];
  let votes = 0;
  let page_1 = 0;
  let page_2 = 0;
  let hasNextPage = false;
  do {
    try {
      let result = await axios.get(`https://api.covalenthq.com/v1/43114/address/${config.gaugeProxy}/transactions_v2/?no-logs=true&page-size=1000&page-number=${page_1++}&key=${config.ckey}`);
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
        console.log(`Gauge allocation votes loaded... (Page ${page_1})`);
      } else {
        hasNextPage = false;
        console.error('API ERROR: Covalent returned an error response.');
        process.exit(1);
      }
    } catch {
      hasNextPage = false;
      console.error('API ERROR: Covalent is likely down.');
      process.exit(1);
    }
  } while(hasNextPage);
  hasNextPage = false;
  do {
    try {
      let result = await axios.get(`https://api.covalenthq.com/v1/43114/address/${config.oldGaugeProxy}/transactions_v2/?no-logs=true&page-size=1000&page-number=${page_2++}&key=${config.ckey}`);
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
        console.log(`Gauge allocation votes loaded... (Page ${page_1 + page_2})`);
      } else {
        hasNextPage = false;
        console.error('API ERROR: Covalent returned an error response.');
        process.exit(1);
      }
    } catch {
      hasNextPage = false;
      console.error('API ERROR: Covalent is likely down.');
      process.exit(1);
    }
  } while(hasNextPage);
  return {voters: wallets, votes};
}

/* ====================================================================================================================================================== */

// Function to get proposal voter info:
const getProposalVoterInfo = async () => {
  let wallets = [];
  let votes = {};
  let voteCount = 0;
  let currentBlock = await avax.getBlockNumber();
  let governanceContract = new ethers.Contract(config.governance, config.voteEventABI, avax);
  let backupGovernanceContract = new ethers.Contract(config.governance, config.voteEventABI, avax_backup);
  let eventFilter = governanceContract.filters.NewVote();
  let backupEventFilter = backupGovernanceContract.filters.NewVote();
  let lastQueriedBlock = startBlock;
  try {
    while(++lastQueriedBlock < currentBlock) {
      let targetBlock = Math.min(lastQueriedBlock + querySize, currentBlock);
      let result;
      while(!result) {
        try {
          result = await governanceContract.queryFilter(eventFilter, lastQueriedBlock, targetBlock);
        } catch {
          try {
            result = await backupGovernanceContract.queryFilter(backupEventFilter, lastQueriedBlock, targetBlock);
          } catch {
            console.log(`RPC ERROR: Retrying block ${lastQueriedBlock} query...`);
          }
        }
      }
      let promises = result.map(event => (async () => {
        if(!wallets.includes(event.args.voter)) {
          wallets.push(event.args.voter);
        }
        if(!votes.hasOwnProperty(`p${event.args.proposalId}`)) {
          votes[`p${event.args.proposalId}`] = [];
        }
        votes[`p${event.args.proposalId}`].push({
          wallet: event.args.voter,
          block: event.blockNumber,
          support: event.args.support,
          votes: parseInt(event.args.votes) / (10 ** 18)
        });
        voteCount++;
      })());
      await Promise.all(promises);
      lastQueriedBlock = targetBlock;
    }
  } catch {
    console.error(`RPC ERROR: Proposal voting transactions were not able to be fetched.`);
    process.exit(1);
  }
  console.log(`Proposal votes loaded...`);
  return {voters: wallets, votes, voteCount};
}

/* ====================================================================================================================================================== */

// Function to get data for each governance proposal:
const getProposalData = async (info) => {
  let proposalData = [];
  let promises = Object.keys(info.votes).map(proposal => (async () => {
    let data = await query(config.governance, config.governanceABI, 'proposals', [proposal.slice(1)]);
    let yesVotes = data.forVotes / (10 ** 18);
    let noVotes = data.againstVotes / (10 ** 18);
    proposalData.push({
      number: parseInt(proposal.slice(1)) + 7,
      votes: yesVotes + noVotes,
      outcome: yesVotes > noVotes ? true : false,
      percentage: (yesVotes > noVotes ? (yesVotes / (yesVotes + noVotes)) * 100 : (noVotes / (yesVotes + noVotes)) * 100).toFixed(2),
      ongoing: (parseInt(data.startTime) + parseInt(data.votingPeriod)) > time ? true : false
    });
  })());
  await Promise.all(promises);
  proposalData.sort((a, b) => a.number - b.number);
  console.log(`Proposal data loaded...`);
  return proposalData;
}

/* ====================================================================================================================================================== */

// Function to get number of current stakers that have voted for gauge allocations and/or any proposals:
const getStakingVoters = (gaugeVoterInfo, proposalVoterInfo, stakerInfo) => {
  let stakers = stakerInfo.filter(stake => stake.unlock > time);
  let numStakingVoters = 0;
  stakers.forEach(stake => {
    if(gaugeVoterInfo.voters.includes(stake.wallet) || proposalVoterInfo.voters.includes(stake.wallet)) {
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
    let gaugeVoterInfo = await getGaugeVoterInfo();
    let proposalVoterInfo = await getProposalVoterInfo();
    let proposalData = await getProposalData(proposalVoterInfo);
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
    let currentStakingVotes = getStakingVoters(gaugeVoterInfo, proposalVoterInfo, stakerInfo);

    // Printing Data:
    console.log('\n  ==============================');
    console.log('  ||        SNOB Stats        ||');
    console.log('  ==============================\n');
    console.log(`  - SNOB Price: $${price}`);
    console.log(`  - Total SNOB Supply: ${totalSupply.toLocaleString(undefined, {maximumFractionDigits: 0})} SNOB`);
    console.log(`  - SNOB Market Cap: $${(price * totalSupply).toLocaleString(undefined, {maximumFractionDigits: 0})}`);
    console.log(`  - SNOB Holders: ${holders.toLocaleString(undefined, {maximumFractionDigits: 0})} Users`);
    console.log(`  - Treasury: $ ${(price * treasuryBalance).toLocaleString(undefined, {maximumFractionDigits: 0})} (${treasuryBalance.toLocaleString(undefined, {maximumFractionDigits: 0})} SNOB)`);
    console.log(`  - Staked SNOB: ${staked.toLocaleString(undefined, {maximumFractionDigits: 0})} SNOB (${((staked / totalSupply) * 100).toFixed(2)}% of total supply)`);
    console.log(`  - Circulating SNOB Supply: ${circulatingSupply.toLocaleString(undefined, {maximumFractionDigits: 0})} SNOB (${((circulatingSupply / totalSupply) * 100).toFixed(2)}% of total supply)`);
    console.log(`  - xSNOB Holders: ${numStakers.toLocaleString(undefined, {maximumFractionDigits: 0})} Users`);
    console.log(`  - Average SNOB Amount Staked: ${avgLockedAmount.toLocaleString(undefined, {maximumFractionDigits: 0})} SNOB`);
    console.log(`  - Average SNOB Locked Time: ${avgLockedTime.toLocaleString(undefined, {maximumFractionDigits: 2})} Years`);
    console.log(`  - Total xSNOB Supply: ${outputSupply.toLocaleString(undefined, {maximumFractionDigits: 0})} xSNOB`);
    console.log(`  - Average xSNOB Amount Held: ${avgOutputAmount.toLocaleString(undefined, {maximumFractionDigits: 0})} xSNOB`);
    console.log(`  - xSNOB Holders w/ 50k+: ${numStakers50k.toLocaleString(undefined, {maximumFractionDigits: 0})} Users`);
    console.log(`  - Forgetful xSNOB Holders: ${forgetfulStakers.toLocaleString(undefined, {maximumFractionDigits: 0})} Users`);
    console.log(`  - SNOB Forgotten: ${forgottenStakes.toLocaleString(undefined, {maximumFractionDigits: 0})} SNOB`);
    console.log(`  - Unclaimed SNOB (From xSNOB): ${unclaimedSNOB.toLocaleString(undefined, {maximumFractionDigits: 0})} SNOB`);
    console.log(`  - Unclaimed AXIAL (From xSNOB): ${unclaimedAXIAL.toLocaleString(undefined, {maximumFractionDigits: 0})} AXIAL`);
    console.log('  - Top 5 xSNOB Holders:');
    richList.forEach(user => {
      console.log(`      > ${user.wallet} - ${user.xsnob.toLocaleString(undefined, {maximumFractionDigits: 0})} xSNOB (${((user.xsnob / outputSupply) * 100).toFixed(2)}% of possible votes)`);
    });
    console.log(`  - Allocation Voters: ${gaugeVoterInfo.voters.length.toLocaleString(undefined, {maximumFractionDigits: 0})} Users`);
    console.log(`  - Proposal Voters: ${proposalVoterInfo.voters.length.toLocaleString(undefined, {maximumFractionDigits: 0})} Users`);
    console.log(`  - Total Allocation Votes: ${gaugeVoterInfo.votes.toLocaleString(undefined, {maximumFractionDigits: 0})} Votes`);
    console.log(`  - Total Proposal Votes: ${proposalVoterInfo.voteCount.toLocaleString(undefined, {maximumFractionDigits: 0})} Votes`);
    console.log(`  - % of Current Stakers Voted: ${((currentStakingVotes / numStakers) * 100).toFixed(2)}%`);
    console.log('  - Proposal Participation & Results:');
    proposalData.forEach(proposal => {
      console.log(`      > Proposal ${proposal.number < 10 ? ` ${proposal.number}` : proposal.number} - ${proposal.votes.toLocaleString(undefined, {maximumFractionDigits: 0})} xSNOB - ${proposal.percentage}% ${proposal.outcome ? `In Favor` : `Against`}${proposal.ongoing ? ` (Ongoing)` : ''}`);
    });

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
    console.log(`  - SNOB Price: $${price}`);
    console.log(`  - Total SNOB Supply: ${totalSupply.toLocaleString(undefined, {maximumFractionDigits: 0})} SNOB`);
    console.log(`  - SNOB Market Cap: $${(price * totalSupply).toLocaleString(undefined, {maximumFractionDigits: 0})}`);
    console.log(`  - Treasury: $ ${(price * treasuryBalance).toLocaleString(undefined, {maximumFractionDigits: 0})} (${treasuryBalance.toLocaleString(undefined, {maximumFractionDigits: 0})} SNOB)`);
    console.log(`  - Staked SNOB: ${staked.toLocaleString(undefined, {maximumFractionDigits: 0})} SNOB (${((staked / totalSupply) * 100).toFixed(2)}% of total supply)`);
    console.log(`  - Circulating SNOB Supply: ${circulatingSupply.toLocaleString(undefined, {maximumFractionDigits: 0})} SNOB (${((circulatingSupply / totalSupply) * 100).toFixed(2)}% of total supply)`);
    console.log(`  - Average SNOB Locked Time: ${avgLockedTime.toLocaleString(undefined, {maximumFractionDigits: 2})} Years`);
    console.log(`  - Total xSNOB Supply: ${outputSupply.toLocaleString(undefined, {maximumFractionDigits: 0})} xSNOB`);
    console.log(`  - Unclaimed SNOB (From xSNOB): ${unclaimedSNOB.toLocaleString(undefined, {maximumFractionDigits: 0})} SNOB`);
    console.log(`  - Unclaimed AXIAL (From xSNOB): ${unclaimedAXIAL.toLocaleString(undefined, {maximumFractionDigits: 0})} AXIAL`);
  }
}

/* ====================================================================================================================================================== */

// Fetching Data:
fetch();
