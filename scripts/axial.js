
// Required Packages:
const { ethers } = require('ethers');
const axios = require('axios');

// Required Config Variables:
const config = require('../config.js');

// Setting Up RPCs:
const avax = new ethers.providers.JsonRpcProvider(config.rpc);
const avax_backup = new ethers.providers.JsonRpcProvider(config.rpc_backup);

// Setting Time Variables:
const week = 604800;

// Setting Block Variables:
// https://api.snowtrace.io/api?module=block&action=getblocknobytime&closest=before&timestamp=<TIMESTAMP>
const blockTimestamps = [
  { block: 6786231, timestamp: 1636588800 }, // Nov. 11, 2021
  { block: 7085471, timestamp: 1637193600 }, // Nov. 18, 2021
  { block: 7386860, timestamp: 1637798400 }, // Nov. 25, 2021
  { block: 7687393, timestamp: 1638403200 }, // Dec.  2, 2021
  { block: 7989367, timestamp: 1639008000 }, // Dec.  9, 2021
  { block: 8290862, timestamp: 1639612800 }, // Dec. 16, 2021
  { block: 8589431, timestamp: 1640217600 }, // Dec. 23, 2021
  { block: 8888076, timestamp: 1640822400 }, // Dec. 30, 2021
  { block: 9187865, timestamp: 1641427200 }, // Jan.  6, 2022
];
const querySize = 50000;

// Setting Up Optional Args:
let basic = false;
const args = process.argv.slice(2);
if(args.length > 0) {
  if(args[0] === 'basic') {
    basic = true;
  }
}

/* ====================================================================================================================================================== */

// Function to get AXIAL Price:
const getPrice = async () => {
  let query = 'https://api.coingecko.com/api/v3/simple/token_price/avalanche?contract_addresses=' + config.axial + '&vs_currencies=usd';
  let result = await axios.get(query);
  let price = result.data[config.axial.toLowerCase()].usd.toFixed(4);
  console.log('Price loaded...');
  return price;
}

/* ====================================================================================================================================================== */

// Function to get total AXIAL supply:
const getTotalSupply = async () => {
  let contract = new ethers.Contract(config.axial, config.minABI, avax);
  let supply = await contract.totalSupply();
  console.log('Total supply loaded...');
  return supply / (10 ** 18);
}

/* ====================================================================================================================================================== */

// Function to get AXIAL in treasury:
const getTreasuryBalance = async () => {
  let contract = new ethers.Contract(config.axial, config.minABI, avax);
  let treasuryBalance = parseInt(await contract.balanceOf(config.treasury));
  console.log('Treasury balance loaded...');
  return treasuryBalance / (10 ** 18);
}

/* ====================================================================================================================================================== */

// Function to get AXIAL in Axial's treasury:
const getAxialTreasuryBalance = async () => {
  let contract = new ethers.Contract(config.axial, config.minABI, avax);
  let treasuryBalance = parseInt(await contract.balanceOf(config.axialTreasury));
  console.log('Axial\'s treasury balance loaded...');
  return treasuryBalance / (10 ** 18);
}

/* ====================================================================================================================================================== */

// Function to get circulating AXIAL supply:
const getCirculatingSupply = (total, treasury, axialTreasury) => {
  let circulatingSupply = total - treasury - axialTreasury;
  return circulatingSupply;
}

/* ====================================================================================================================================================== */

// Function to get transactions:
const getTXs = async () => {
  let txs = {};
  let currentBlock = await avax.getBlockNumber();
  let promises = config.axialPools.map(pool => (async () => {
    txs[pool.name] = [];
    let swapContract = new ethers.Contract(pool.swap, config.axialSwapEventABI, avax);
    let backupSwapContract = new ethers.Contract(pool.swap, config.axialSwapEventABI, avax_backup);
    let eventFilter = swapContract.filters.TokenSwap();
    let backupEventFilter = backupSwapContract.filters.TokenSwap();
    let lastQueriedBlock = blockTimestamps[0].block;
    try {
      while(++lastQueriedBlock < currentBlock) {
        let targetBlock = Math.min(lastQueriedBlock + querySize, currentBlock);
        let result;
        while(!result) {
          try {
            result = await swapContract.queryFilter(eventFilter, lastQueriedBlock, targetBlock);
          } catch {
            try {
              result = await backupSwapContract.queryFilter(backupEventFilter, lastQueriedBlock, targetBlock);
            } catch {
              console.log(`RPC Error: Retrying block ${lastQueriedBlock} query for ${pool.name}...`);
            }
          }
        }
        let event_promises = result.map(event => (async () => {
          txs[pool.name].push({
            wallet: event.args.buyer.toLowerCase(),
            block: event.blockNumber,
            sold: {
              token: pool.tokens[parseInt(event.args.soldId)].symbol,
              amount: parseInt(event.args.tokensSold) / (10 ** pool.tokens[parseInt(event.args.soldId)].decimals)
            },
            bought: {
              token: pool.tokens[parseInt(event.args.boughtId)].symbol,
              amount: parseInt(event.args.tokensBought) / (10 ** pool.tokens[parseInt(event.args.boughtId)].decimals)
            },
          });
        })());
        await Promise.all(event_promises);
        lastQueriedBlock = targetBlock;
      }
      console.log(`${pool.name} transactions loaded...`);
    } catch {
      console.error(`RPC Error: ${pool.name} transactions were not able to be fetched.`);
    }
  })());
  await Promise.all(promises);
  return txs;
}

/* ====================================================================================================================================================== */

// Function to get total number of transactions:
const getNumTXs = (txs) => {
  let sum = 0;
  config.axialPools.forEach(pool => {
    sum += txs[pool.name].length;
  });
  return sum;
}

/* ====================================================================================================================================================== */

// Function to get total value swapped:
const getTotalSwapped = (txs) => {
  let sum = 0;
  config.axialPools.forEach(pool => {
    txs[pool.name].forEach(tx => {
      sum += tx.sold.amount;
    });
  });
  return sum;
}

/* ====================================================================================================================================================== */

// Function to get total weekly volume:
const getWeeklyVolume = (txs) => {
  let values = [];
  config.axialPools.forEach(pool => {
    for(let week = 0; week < blockTimestamps.length - 1; week++) {
      let volume = 0;
      txs[pool.name].forEach(tx => {
        if(tx.block > blockTimestamps[week].block && tx.block < blockTimestamps[week + 1].block) {
          volume += tx.sold.amount;
        }
      });
      let entry = values.find(i => i.week === week);
      if(entry) {
        entry.volume += volume;
      } else {
        let time = blockTimestamps[week].timestamp;
        values.push({week, time, volume});
      }
    }
  });
  return values;
}

/* ====================================================================================================================================================== */

// Function to get pool-specific number of transactions:
const getPoolNumTXs = (txs) => {
  let values = [];
  config.axialPools.forEach(pool => {
    values.push({
      name: pool.name,
      txCount: txs[pool.name].length
    });
  });
  values.sort((a, b) => b.txCount - a.txCount);
  return values;
}

/* ====================================================================================================================================================== */

// Function to get pool-specific value swapped:
const getPoolValueSwapped = (txs) => {
  let values = [];
  config.axialPools.forEach(pool => {
    let volume = 0;
    txs[pool.name].forEach(tx => {
      volume += tx.sold.amount;
    });
    let name = pool.name;
    values.push({name, volume});
  });
  values.sort((a, b) => b.volume - a.volume);
  return values;
}

/* ====================================================================================================================================================== */

// Function to get pool-specific weekly volume:
const getPoolWeeklyVolume = (txs) => {
  let values = [];
  config.axialPools.forEach(pool => {
    let weeks = [];
    for(let week = 0; week < blockTimestamps.length - 1; week++) {
      let volume = 0;
      txs[pool.name].forEach(tx => {
        if(tx.block > blockTimestamps[week].block && tx.block < blockTimestamps[week + 1].block) {
          volume += tx.sold.amount;
        }
      });
      let time = blockTimestamps[week].timestamp;
      weeks.push({time, volume});
    }
    let name = pool.name;
    values.push({name, weeks});
  });
  return values;
}

/* ====================================================================================================================================================== */

// Function to get biggest swappers:
const getBiggestSwappers = (txs) => {
  let wallets = [];
  config.axialPools.forEach(pool => {
    txs[pool.name].forEach(tx => {
      let wallet = wallets.find(i => i.address === tx.wallet);
      if(wallet) {
        wallet.amount += tx.sold.amount;
        wallet.txs += 1;
      } else {
        wallets.push({
          address: tx.wallet,
          amount: tx.sold.amount,
          txs: 1
        });
      }
    });
  });
  wallets.sort((a, b) => b.amount - a.amount);
  return wallets.slice(0, 5);
}

/* ====================================================================================================================================================== */

// Function to get token demand:
const getTokenDemand = (txs) => {
  let tokenDemand = [];
  let values = {};
  config.axialPools.forEach(pool => {
    txs[pool.name].forEach(tx => {
      values[tx.bought.token] ? values[tx.bought.token] += tx.bought.amount : values[tx.bought.token] = tx.bought.amount;
    });
  });
  Object.keys(values).forEach(token => {
    tokenDemand.push({token, demand: values[token]})
  });
  tokenDemand.sort((a, b) => b.demand - a.demand);
  return tokenDemand;
}

/* ====================================================================================================================================================== */

// Function to get swap stats:
const getSwapStats = (txs) => {
  let values = {};
  config.axialPools.forEach(pool => {
    let largestSwap = txs[pool.name].map(item => item.sold.amount).reduce((prev, next) => prev > next ? prev : next);
    let averageSwap = txs[pool.name].map(item => item.sold.amount).reduce((prev, next) => prev + next) / txs[pool.name].length;
    let percentages = {
      above1k: ((txs[pool.name].filter(tx => tx.sold.amount > 1000).length / txs[pool.name].length) * 100).toFixed(2),
      above5k: ((txs[pool.name].filter(tx => tx.sold.amount > 5000).length / txs[pool.name].length) * 100).toFixed(2),
      above10k: ((txs[pool.name].filter(tx => tx.sold.amount > 10000).length / txs[pool.name].length) * 100).toFixed(2),
      above25k: ((txs[pool.name].filter(tx => tx.sold.amount > 25000).length / txs[pool.name].length) * 100).toFixed(2),
      above50k: ((txs[pool.name].filter(tx => tx.sold.amount > 50000).length / txs[pool.name].length) * 100).toFixed(2),
      above100k: ((txs[pool.name].filter(tx => tx.sold.amount > 100000).length / txs[pool.name].length) * 100).toFixed(2),
      above250k: ((txs[pool.name].filter(tx => tx.sold.amount > 250000).length / txs[pool.name].length) * 100).toFixed(2),
      above500k: ((txs[pool.name].filter(tx => tx.sold.amount > 500000).length / txs[pool.name].length) * 100).toFixed(2),
      above1000k: ((txs[pool.name].filter(tx => tx.sold.amount > 1000000).length / txs[pool.name].length) * 100).toFixed(2)
    }
    values[pool.name] = {largestSwap, averageSwap, percentages};
  });
  return values;
}

/* ====================================================================================================================================================== */

// Function to pad date if necessary:
const pad = (num) => {
  let str = num.toString();
  if(str.length < 2) {
    return '0' + str;
  } else {
    return str;
  }
}

/* ====================================================================================================================================================== */

// Function to fetch all stats:
const fetch = async () => {

  // Full Data:
  if(!basic) {

    // Fetching Data:
    let price = await getPrice();
    let totalSupply = await getTotalSupply();
    let treasuryBalance = await getTreasuryBalance();
    let axialTreasuryBalance = await getAxialTreasuryBalance();
    let circulatingSupply = getCirculatingSupply(totalSupply, treasuryBalance, axialTreasuryBalance);
    let txs = await getTXs();
    let numTXs = getNumTXs(txs);
    let totalSwapped = getTotalSwapped(txs);
    let weeklyVolume = getWeeklyVolume(txs);
    let poolNumTXs = getPoolNumTXs(txs);
    let poolValueSwapped = getPoolValueSwapped(txs);
    let poolWeeklyVolume = getPoolWeeklyVolume(txs);
    let biggestSwappers = getBiggestSwappers(txs);
    let tokenDemand = getTokenDemand(txs);
    let swapStats = getSwapStats(txs);

    // // Printing Data:
    console.log('\n  ===============================');
    console.log('  ||        AXIAL Stats        ||');
    console.log('  ===============================\n');
    console.log(`  - AXIAL Price: $${price}`);
    console.log(`  - Total AXIAL Supply: ${totalSupply.toLocaleString(undefined, {maximumFractionDigits: 0})} AXIAL`);
    console.log(`  - AXIAL Market Cap: $${(price * totalSupply).toLocaleString(undefined, {maximumFractionDigits: 0})}`);
    console.log(`  - Treasury: $${(price * treasuryBalance).toLocaleString(undefined, {maximumFractionDigits: 0})} (${treasuryBalance.toLocaleString(undefined, {maximumFractionDigits: 0})} AXIAL)`);
    console.log(`  - Axial Treasury: $${(price * axialTreasuryBalance).toLocaleString(undefined, {maximumFractionDigits: 0})} (${axialTreasuryBalance.toLocaleString(undefined, {maximumFractionDigits: 0})} AXIAL)`);
    console.log(`  - Circulating AXIAL Supply: ${circulatingSupply.toLocaleString(undefined, {maximumFractionDigits: 0})} AXIAL (${((circulatingSupply / totalSupply) * 100).toFixed(2)}% of total supply)`);
    console.log(`  - Total Value Swapped: $${totalSwapped.toLocaleString(undefined, {maximumFractionDigits: 0})} ($${(totalSwapped * 0.0004).toLocaleString(undefined, {maximumFractionDigits: 0})} Swap Fees)`);
    poolValueSwapped.forEach(pool => {
      console.log(`      > ${pool.name} - $${pool.volume.toLocaleString(undefined, {maximumFractionDigits: 0})} ($${(pool.volume * 0.0004).toLocaleString(undefined, {maximumFractionDigits: 0})} Swap Fees)`);
    });
    console.log(`  - Total # of Swap Transactions: ${numTXs.toLocaleString(undefined, {maximumFractionDigits: 0})} TXs`);
    poolNumTXs.forEach(pool => {
      console.log(`      > ${pool.name} - ${pool.txCount.toLocaleString(undefined, {maximumFractionDigits: 0})} TXs`);
    });
    console.log('  - Weekly Value Swapped:');
    weeklyVolume.forEach(item => {
      let rawDate = new Date((item.time) * 1000);
      let date = pad(rawDate.getUTCDate()) + '/' + pad(rawDate.getUTCMonth() + 1) + '/' + rawDate.getUTCFullYear();
      let rawEndDate = new Date((item.time + week - 1) * 1000);
      let endDate = pad(rawEndDate.getUTCDate()) + '/' + pad(rawEndDate.getUTCMonth() + 1) + '/' + rawEndDate.getUTCFullYear();
      console.log(`      > Week ${(item.week + 1).toLocaleString(undefined, {maximumFractionDigits: 0})} (${date} to ${endDate}) - $${item.volume.toLocaleString(undefined, {maximumFractionDigits: 0})} ($${(item.volume * 0.0004).toLocaleString(undefined, {maximumFractionDigits: 0})} Swap Fees)`);
      poolWeeklyVolume.forEach(pool => {
        if(pool.weeks[item.week].volume > 0) {
          console.log(`        - ${pool.name} - $${pool.weeks[item.week].volume.toLocaleString(undefined, {maximumFractionDigits: 0})} ($${(pool.weeks[item.week].volume * 0.0004).toLocaleString(undefined, {maximumFractionDigits: 0})} Swap Fees)`);
        }
      });
    });
    console.log('  - Largest Swaps:');
    Object.keys(swapStats).forEach(pool => {
      console.log(`      > ${pool} - $${swapStats[pool].largestSwap.toLocaleString(undefined, {maximumFractionDigits: 0})}`);
    });
    console.log('  - Average Swap:');
    Object.keys(swapStats).forEach(pool => {
      console.log(`      > ${pool} - $${swapStats[pool].averageSwap.toLocaleString(undefined, {maximumFractionDigits: 0})}`);
    });
    console.log('  - Swap Size Distribution (Swap % Above):');
    Object.keys(swapStats).forEach(pool => {
      console.log(`      > ${pool} - $1k: ${swapStats[pool].percentages.above1k}%, $5k: ${swapStats[pool].percentages.above5k}%, $10k: ${swapStats[pool].percentages.above10k}%, $25k: ${swapStats[pool].percentages.above25k >= 10 ? swapStats[pool].percentages.above25k : ' ' + swapStats[pool].percentages.above25k}%, $50k: ${swapStats[pool].percentages.above50k}%, $100k: ${swapStats[pool].percentages.above100k}%, $250k: ${swapStats[pool].percentages.above250k}%, $500k: ${swapStats[pool].percentages.above500k}%, $1M: ${swapStats[pool].percentages.above1000k}%`);
    });
    console.log('  - Token Swap Demand:');
    tokenDemand.forEach(item => {
      console.log(`      > ${item.token} - $${item.demand.toLocaleString(undefined, {maximumFractionDigits: 0})}`);
    });
    console.log('  - Top 5 Biggest Swappers:');
    biggestSwappers.forEach(wallet => {
      console.log(`      > ${wallet.address} - $${wallet.amount.toLocaleString(undefined, {maximumFractionDigits: 0})} (${wallet.txs.toLocaleString(undefined, {maximumFractionDigits: 0})} TX${wallet.txs > 1 ? 's' : ''}) ${(wallet.address === config.paraswap ? '(ParaSwap Router)' : '')}`);
    });

  // Basic Data (Loads Faster):
  } else {

    // Fetching Data:
    let price = await getPrice();
    let totalSupply = await getTotalSupply();
    let treasuryBalance = await getTreasuryBalance();
    let axialTreasuryBalance = await getAxialTreasuryBalance();
    let circulatingSupply = getCirculatingSupply(totalSupply, treasuryBalance, axialTreasuryBalance);

    // Printing Data:
    console.log('\n  ==============================');
    console.log('  ||       AXIAL Stats        ||');
    console.log('  ==============================\n');
    console.log(`  - AXIAL Price: $${price}`);
    console.log(`  - Total AXIAL Supply: ${totalSupply.toLocaleString(undefined, {maximumFractionDigits: 0})} AXIAL`);
    console.log(`  - AXIAL Market Cap: $${(price * totalSupply).toLocaleString(undefined, {maximumFractionDigits: 0})}`);
    console.log(`  - Treasury: $${(price * treasuryBalance).toLocaleString(undefined, {maximumFractionDigits: 0})} (${treasuryBalance.toLocaleString(undefined, {maximumFractionDigits: 0})} AXIAL)`);
    console.log(`  - Axial Treasury: $${(price * axialTreasuryBalance).toLocaleString(undefined, {maximumFractionDigits: 0})} (${axialTreasuryBalance.toLocaleString(undefined, {maximumFractionDigits: 0})} AXIAL)`);
    console.log(`  - Circulating AXIAL Supply: ${circulatingSupply.toLocaleString(undefined, {maximumFractionDigits: 0})} AXIAL (${((circulatingSupply / totalSupply) * 100).toFixed(2)}% of total supply)`);
  }
}

/* ====================================================================================================================================================== */

// Fetching Data:
fetch();
