
// Required Packages:
const { query, queryBlocks, writeText, getTokenPrice, getTokenHolders, getCovalentTXs } = require('../functions.js');
const config = require('../config.js');

// Setting Up Optional Args:
let basic = false;
const args = process.argv.slice(2);
if(args.length > 0) {
  if(args[0] === 'basic') {
    basic = true;
  }
}

// Initializations:
const time = Math.round(Date.now() / 1000);
let data = '';

/* ====================================================================================================================================================== */

// Function to get SNOB Price:
const getPrice = async () => {
  let price = await getTokenPrice(config.snob);
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
  let holders = (await getTokenHolders(config.snob)).length;
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
  let events = await queryBlocks(config.snob, config.transferEventABI, 'Transfer', 1860000, 100000, [null, config.xsnob]);
  let promises = events.map(event => (async () => {
    if(!wallets.includes(event.args.from)) {
      wallets.push(event.args.from);
    }
  })());
  await Promise.all(promises);
  console.log('xSNOB transactions loaded...');
  for(let i = 0; i < wallets.length; i += 100) {
    let stake_promises = wallets.slice(i, Math.min(wallets.length - 1, i + 100)).map(wallet => (async () => {
      let stake = await query(config.xsnob, config.xsnobABI, 'locked', [wallet]);
      let amount = parseInt(stake.amount) / (10 ** 18);
      let unlock = parseInt(stake.end);
      if(amount > 0) {
        stakerInfo.push({wallet, amount, unlock});
      }
    })());
    await Promise.all(stake_promises);
  }
  console.log('xSNOB staker info loaded...');
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
  let ignoredAddresses = [config.gaugeProxy.toLowerCase(), config.oldGaugeProxy.toLowerCase(), config.operations.toLowerCase(), '0xc9a51fb9057380494262fd291aed74317332c0a2'.toLowerCase()];
  let gaugeProxyTXs = await getCovalentTXs(config.gaugeProxy);
  let oldGaugeProxyTXs = await getCovalentTXs(config.oldGaugeProxy);
  console.log('Gauge allocation votes loaded...');
  gaugeProxyTXs.forEach(tx => {
    if(!ignoredAddresses.includes(tx.from_address.toLowerCase())) {
      if(!wallets.includes(tx.from_address)) {
        wallets.push(tx.from_address);
      }
      votes++;
    }
  });
  oldGaugeProxyTXs.forEach(tx => {
    if(!ignoredAddresses.includes(tx.from_address.toLowerCase())) {
      if(!wallets.includes(tx.from_address)) {
        wallets.push(tx.from_address);
      }
      votes++;
    }
  });
  console.log('Gauge allocation votes counted...');
  return {voters: wallets, votes};
}

/* ====================================================================================================================================================== */

// Function to get proposal voter info:
const getProposalVoterInfo = async () => {
  let wallets = [];
  let votes = {};
  let voteCount = 0;
  let events = await queryBlocks(config.governance, config.voteEventABI, 'NewVote', 2477000, 100000, []);
  let promises = events.map(event => (async () => {
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
  console.log('Proposal votes loaded...');
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
  console.log('Proposal data loaded...');
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

  // Adding Banner:
  data += '\n  ==============================\n';
  data += '  ||        SNOB Stats        ||\n';
  data += '  ==============================\n\n';

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
    let proposalVoterInfo = await getProposalVoterInfo();
    let proposalData = await getProposalData(proposalVoterInfo);
    let gaugeVoterInfo = await getGaugeVoterInfo();
    let unclaimedSNOB = await getUnclaimedSNOB();
    let unclaimedAXIAL = await getUnclaimedAXIAL();
    let stakerInfo = await getStakerInfo();
    let numStakers = getStakers(stakerInfo);
    let avgLockedAmount = getAvgLockedAmount(stakerInfo);
    let avgLockedTime = getAvgLockedTime(staked, outputSupply);
    let avgOutputAmount = getAvgOutputAmount(avgLockedAmount, avgLockedTime);
    let numStakers50k = getNumStakers50k(stakerInfo);
    let forgetfulStakers = getForgetfulStakers(stakerInfo);
    let forgottenStakes = getForgottenStakes(stakerInfo);
    let richList = getRichList(stakerInfo);
    let currentStakingVotes = getStakingVoters(gaugeVoterInfo, proposalVoterInfo, stakerInfo);

    // Writing Data:
    data += `  - SNOB Price: $${price}\n`;
    data += `  - Total SNOB Supply: ${totalSupply.toLocaleString(undefined, {maximumFractionDigits: 0})} SNOB\n`;
    data += `  - SNOB Market Cap: $${(price * totalSupply).toLocaleString(undefined, {maximumFractionDigits: 0})}\n`;
    data += `  - SNOB Holders: ${holders.toLocaleString(undefined, {maximumFractionDigits: 0})} Users\n`;
    data += `  - Treasury: $ ${(price * treasuryBalance).toLocaleString(undefined, {maximumFractionDigits: 0})} (${treasuryBalance.toLocaleString(undefined, {maximumFractionDigits: 0})} SNOB)\n`;
    data += `  - Staked SNOB: ${staked.toLocaleString(undefined, {maximumFractionDigits: 0})} SNOB (${((staked / totalSupply) * 100).toFixed(2)}% of total supply)\n`;
    data += `  - Circulating SNOB Supply: ${circulatingSupply.toLocaleString(undefined, {maximumFractionDigits: 0})} SNOB (${((circulatingSupply / totalSupply) * 100).toFixed(2)}% of total supply)\n`;
    data += `  - xSNOB Holders: ${numStakers.toLocaleString(undefined, {maximumFractionDigits: 0})} Users\n`;
    data += `  - Average SNOB Amount Staked: ${avgLockedAmount.toLocaleString(undefined, {maximumFractionDigits: 0})} SNOB\n`;
    data += `  - Average SNOB Locked Time: ${avgLockedTime.toLocaleString(undefined, {maximumFractionDigits: 2})} Years\n`;
    data += `  - Total xSNOB Supply: ${outputSupply.toLocaleString(undefined, {maximumFractionDigits: 0})} xSNOB\n`;
    data += `  - Average xSNOB Amount Held: ${avgOutputAmount.toLocaleString(undefined, {maximumFractionDigits: 0})} xSNOB\n`;
    data += `  - xSNOB Holders w/ 50k+: ${numStakers50k.toLocaleString(undefined, {maximumFractionDigits: 0})} Users\n`;
    data += `  - Forgetful xSNOB Holders: ${forgetfulStakers.toLocaleString(undefined, {maximumFractionDigits: 0})} Users\n`;
    data += `  - SNOB Forgotten: ${forgottenStakes.toLocaleString(undefined, {maximumFractionDigits: 0})} SNOB\n`;
    data += `  - Unclaimed SNOB (From xSNOB): ${unclaimedSNOB.toLocaleString(undefined, {maximumFractionDigits: 0})} SNOB\n`;
    data += `  - Unclaimed AXIAL (From xSNOB): ${unclaimedAXIAL.toLocaleString(undefined, {maximumFractionDigits: 0})} AXIAL\n`;
    data += '  - Top 5 xSNOB Holders:\n';
    richList.forEach(user => {
      data += `      > ${user.wallet} - ${user.xsnob.toLocaleString(undefined, {maximumFractionDigits: 0})} xSNOB (${((user.xsnob / outputSupply) * 100).toFixed(2)}% of possible votes)\n`;
    });
    data += `  - Allocation Voters: ${gaugeVoterInfo.voters.length.toLocaleString(undefined, {maximumFractionDigits: 0})} Users\n`;
    data += `  - Proposal Voters: ${proposalVoterInfo.voters.length.toLocaleString(undefined, {maximumFractionDigits: 0})} Users\n`;
    data += `  - Total Allocation Votes: ${gaugeVoterInfo.votes.toLocaleString(undefined, {maximumFractionDigits: 0})} Votes\n`;
    data += `  - Total Proposal Votes: ${proposalVoterInfo.voteCount.toLocaleString(undefined, {maximumFractionDigits: 0})} Votes\n`;
    data += `  - % of Current Stakers Voted: ${((currentStakingVotes / numStakers) * 100).toFixed(2)}%\n`;
    data += '  - Proposal Participation & Results:\n';
    proposalData.forEach(proposal => {
      data += `      > Proposal ${proposal.number < 10 ? ` ${proposal.number}` : proposal.number} - ${proposal.votes.toLocaleString(undefined, {maximumFractionDigits: 0})} xSNOB - ${proposal.percentage}% ${proposal.outcome ? `In Favor` : `Against`}${proposal.ongoing ? ` (Ongoing)` : ''}\n`;
    });

    // Updating Text File:
    writeText(data, 'snowballStats');

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

    // Writing Data:
    data += `  - SNOB Price: $${price}\n`;
    data += `  - Total SNOB Supply: ${totalSupply.toLocaleString(undefined, {maximumFractionDigits: 0})} SNOB\n`;
    data += `  - SNOB Market Cap: $${(price * totalSupply).toLocaleString(undefined, {maximumFractionDigits: 0})}\n`;
    data += `  - Treasury: $ ${(price * treasuryBalance).toLocaleString(undefined, {maximumFractionDigits: 0})} (${treasuryBalance.toLocaleString(undefined, {maximumFractionDigits: 0})} SNOB)\n`;
    data += `  - Staked SNOB: ${staked.toLocaleString(undefined, {maximumFractionDigits: 0})} SNOB (${((staked / totalSupply) * 100).toFixed(2)}% of total supply)\n`;
    data += `  - Circulating SNOB Supply: ${circulatingSupply.toLocaleString(undefined, {maximumFractionDigits: 0})} SNOB (${((circulatingSupply / totalSupply) * 100).toFixed(2)}% of total supply)\n`;
    data += `  - Average SNOB Locked Time: ${avgLockedTime.toLocaleString(undefined, {maximumFractionDigits: 2})} Years\n`;
    data += `  - Total xSNOB Supply: ${outputSupply.toLocaleString(undefined, {maximumFractionDigits: 0})} xSNOB\n`;
    data += `  - Unclaimed SNOB (From xSNOB): ${unclaimedSNOB.toLocaleString(undefined, {maximumFractionDigits: 0})} SNOB\n`;
    data += `  - Unclaimed AXIAL (From xSNOB): ${unclaimedAXIAL.toLocaleString(undefined, {maximumFractionDigits: 0})} AXIAL\n`;

    // Updating Text File:
    writeText(data, 'snowballBasicStats');
  }
}

/* ====================================================================================================================================================== */

// Fetching Data:
fetch();
