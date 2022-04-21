
// Required Packages:
const { query, queryBlocks, writeText } = require('../functions.js');
const config = require('../config.js');

// Initializations:
const time = Math.round(Date.now() / 1000);
const week = 604800;
let data = '';

// Harvest Stats: // <TODO> Temporary - find a way to query these on-chain accurately and remove this.
const harvestStats = [
  102065,
  81844,
  447948,
  1364463,
  579098,
  637679,
  1096995,
  998976,
  632175,
  488248,
  550994,
  655759,
  569822,
  733739,
  450961,
  767507,
  485935,
  368543,
  344617,
  326768,
  306649,
  273999,
  191404,
  157512,
  69245,
  63852,
  89075,
  85119,
  61392,
  56051,
  51143,
  44357,
  49617,
  57079,
  51544,
  32032,
  32792
];

/* ====================================================================================================================================================== */

// Function to get revenue generated for users through Snowball Earn's auto-compounding strategies:
const getSnowballEarnRevenue = async () => {
  
  // Initializations:
  let revenue = 0;
  
  // Fetching Harvests:
  // <TODO>
  // console.log(`Snowball Earn harvests fetched...`);

  // Calculating Revenue:
  harvestStats.forEach(harvest => {
    revenue += harvest;
  });

  return revenue;
}

/* ====================================================================================================================================================== */

// Function to get revenue generated for users through xSNOB (SNOB Staking):
const getSnowballStakingRevenue = async () => {

  // Initializations:
  let revenue = 0;
  let distributions = [];
  let timestamps = [];

  // Fetching Distribution Timestamps:
  let startTime = parseInt(await query(config.feeDistributor, config.feeDistributorABI, 'start_time', []));
  let tempTime = startTime;
  while(tempTime < (time - week)) {
    timestamps.push(tempTime);
    tempTime += week;
  }

  // Fetching Distribution Amounts:
  let promises = timestamps.map(timestamp => (async () => {
    let snob = parseInt(await query(config.feeDistributor, config.feeDistributorABI, 'tokens_per_week', [timestamp])) / (10 ** 18);
    let axial = parseInt(await query(config.axialFeeDistributor, config.feeDistributorABI, 'tokens_per_week', [timestamp])) / (10 ** 18);
    distributions.push({ timestamp, snob, axial });
  })());
  await Promise.all(promises);
  console.log(`xSNOB distributions fetched...`);

  // Calculating Revenue:
  distributions.forEach(distribution => {
    let data = config.weeklyData.find(i => i.timestamp == (distribution.timestamp + week));
    if(data) {
      revenue += distribution.snob * data.snob;
      if(distribution.axial > 0) {
        revenue += distribution.axial * data.axial;
      }
    } else {
      console.error(`No weekly data found for timestamp: ${distribution.timestamp + week}`);
    }
  });

  return revenue;
}

/* ====================================================================================================================================================== */

// Function to get revenue generated for users through Axial's liquidity pools:
const getAxialRevenue = async () => {

  // Initializations:
  let revenue = 0;
  let tokensSwapped = 0;

  // Fetching Token Swaps:
  let promises = config.axialPools.map(pool => (async () => {
    let events;
    if(pool.name.includes('-')) {
      events = await queryBlocks(pool.swap, config.axialMetapoolSwapEventABI, 'TokenSwapUnderlying', config.axialDistributions[0].block, 50000, []);
    } else {
      events = await queryBlocks(pool.swap, config.axialSwapEventABI, 'TokenSwap', config.axialDistributions[0].block, 50000, []);
    }
    events.forEach(event => {
      let soldTokenDecimals = pool.name.includes('-') ? pool.metaTokens[parseInt(event.args.soldId)].decimals : pool.tokens[parseInt(event.args.soldId)].decimals;
      tokensSwapped += parseInt(event.args.tokensSold) / (10 ** soldTokenDecimals);
    });
    console.log(`Axial ${pool.name} pool swaps fetched...`);
  })());
  await Promise.all(promises);

  // Calculating Revenue:
  revenue += tokensSwapped * 0.0003;

  return revenue;
}

/* ====================================================================================================================================================== */

// Function to get revenue generated for users through Teddy's TEDDY staking pool:
const getTeddyStakingRevenue = async () => {

  // Initializations:
  let revenue = 0;

  // Fetching TSD Distributions:
  // <TODO>
  // console.log(`Teddy Staking TSD distributions fetched...`);

  // Fetching AVAX Distributions:
  // <TODO>
  // console.log(`Teddy Staking AVAX distributions fetched...`);

  // Calculating Revenue:
  // <TODO>

  return revenue;
}
/* ====================================================================================================================================================== */

// Function to get revenue generated for users through Teddy's TSD staking pool:
const getTeddyDollarStakingRevenue = async () => {

  // Initializations:
  let revenue = 0;

  // Fetching TEDDY Distributions:
  // <TODO>
  // console.log(`Teddy Stability Pool TEDDY distributions fetched...`);

  // Fetching AVAX Distributions:
  // <TODO>
  // console.log(`Teddy Stability Pool AVAX distributions fetched...`);

  // Calculating Revenue:
  // <TODO>

  return revenue;
}

/* ====================================================================================================================================================== */

// Function to fetch all stats:
const fetch = async () => {

  // Adding Banner:
  data += '\n  ======================================\n';
  data += '  ||        User Revenue Stats        ||\n';
  data += '  ======================================\n\n';

  // Fetching Data:
  let snowballEarnRevenue = await getSnowballEarnRevenue();
  let snowballStakingRevenue =  await getSnowballStakingRevenue();
  let axialRevenue = await getAxialRevenue();
  let teddyStakingRevenue = await getTeddyStakingRevenue();
  let teddyDollarStakingRevenue = await getTeddyDollarStakingRevenue();

  // Writing Data:
  data += `  - Total Snowball Ecosystem User Revenue Generated: $${(snowballEarnRevenue + snowballStakingRevenue + axialRevenue + teddyStakingRevenue + teddyDollarStakingRevenue).toLocaleString(undefined, {maximumFractionDigits: 0})}\n`;
  data += `      > Snowball Earn Revenue: $${snowballEarnRevenue.toLocaleString(undefined, {maximumFractionDigits: 0})}\n`;
  data += `      > xSNOB Revenue: $${snowballStakingRevenue.toLocaleString(undefined, {maximumFractionDigits: 0})}\n`;
  data += `      > Axial Revenue: $${axialRevenue.toLocaleString(undefined, {maximumFractionDigits: 0})}\n`;
  data += `      > TEDDY Staking Revenue: $${teddyStakingRevenue.toLocaleString(undefined, {maximumFractionDigits: 0})}\n`;
  data += `      > TSD Staking Revenue: $${teddyDollarStakingRevenue.toLocaleString(undefined, {maximumFractionDigits: 0})}\n`;

  // Updating Text File:
  writeText(data, 'userRevenueStats');
}

/* ====================================================================================================================================================== */

// Fetching Data:
fetch();
