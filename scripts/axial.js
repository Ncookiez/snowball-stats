
// Required Packages:
const { query, queryBlocks, writeText, writeJSON, getTokenPrice, getCurrentBlock, pad } = require('../functions.js');
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
const week = 604800;
const blockQuerySize = 50000;
let data = '';

/* ====================================================================================================================================================== */

// Function to get AXIAL Price:
const getPrice = async () => {
  let price = await getTokenPrice(config.axial);
  console.log('Price loaded...');
  return price.toFixed(4);
}

/* ====================================================================================================================================================== */

// Function to get total AXIAL supply:
const getTotalSupply = async () => {
  let supply = parseInt(await query(config.axial, config.minABI, 'totalSupply', []));
  console.log('Total supply loaded...');
  return supply / (10 ** 18);
}

/* ====================================================================================================================================================== */

// Function to get AXIAL in Snowball's treasury:
const getTreasuryBalance = async () => {
  let treasuryBalance = parseInt(await query(config.axial, config.minABI, 'balanceOf', [config.treasury]));
  console.log('Snowball\'s treasury balance loaded...');
  return treasuryBalance / (10 ** 18);
}

/* ====================================================================================================================================================== */

// Function to get AXIAL in Axial's treasury:
const getAxialTreasuryBalance = async () => {
  let treasuryBalance = parseInt(await query(config.axial, config.minABI, 'balanceOf', [config.axialTreasury]));
  console.log('Treasury balance loaded...');
  return treasuryBalance / (10 ** 18);
}

/* ====================================================================================================================================================== */

// Function to get circulating AXIAL supply:
const getCirculatingSupply = (total, treasury, axialTreasury) => {
  let circulatingSupply = total - treasury - axialTreasury;
  return circulatingSupply;
}

/* ====================================================================================================================================================== */

// Function to get swap transactions:
const getTXs = async () => {
  let txs = {};
  let promises = config.axialPools.map(pool => (async () => {
    txs[pool.name] = [];
    let events;
    if(pool.name.includes('-')) {
      events = await queryBlocks(pool.swap, config.axialMetapoolSwapEventABI, 'TokenSwapUnderlying', config.axialFirstDistribution.block, blockQuerySize, []);
    } else {
      events = await queryBlocks(pool.swap, config.axialSwapEventABI, 'TokenSwap', config.axialFirstDistribution.block, blockQuerySize, []);
    }
    let event_promises = events.map(event => (async () => {
      let soldTokenSymbol = pool.name.includes('-') ? pool.metaTokens[parseInt(event.args.soldId)].symbol : pool.tokens[parseInt(event.args.soldId)].symbol;
      let soldTokenDecimals = pool.name.includes('-') ? pool.metaTokens[parseInt(event.args.soldId)].decimals : pool.tokens[parseInt(event.args.soldId)].decimals;
      let boughtTokenSymbol = pool.name.includes('-') ? pool.metaTokens[parseInt(event.args.boughtId)].symbol : pool.tokens[parseInt(event.args.boughtId)].symbol;
      let boughtTokenDecimals = pool.name.includes('-') ? pool.metaTokens[parseInt(event.args.boughtId)].decimals : pool.tokens[parseInt(event.args.boughtId)].decimals;
      txs[pool.name].push({
        wallet: event.args.buyer.toLowerCase(),
        block: event.blockNumber,
        sold: {
          token: soldTokenSymbol,
          amount: parseInt(event.args.tokensSold) / (10 ** soldTokenDecimals)
        },
        bought: {
          token: boughtTokenSymbol,
          amount: parseInt(event.args.tokensBought) / (10 ** boughtTokenDecimals)
        }
      });
    })());
    await Promise.all(event_promises);
    console.log(`${pool.name} transactions loaded...`);
  })());
  await Promise.all(promises);

  // Finding Estimated Daily Token Volume (Optional):
  // findDailyTokenVolume(txs);

  return txs;
}

/* ====================================================================================================================================================== */

// Function to find estimated daily token volume:
const findDailyTokenVolume = async (txs) => {

  // Initializations:
  let data = {};
  let dailyBlocks = [];

  // Estimating Daily Block Values:
  for(let i = 0; i < config.weeklyData.length; i++) {
    if(config.weeklyData[i].block >= config.axialFirstDistribution.block) {
      if(i != config.weeklyData.length - 1) {
        let dailyBlockSpacing = Math.floor((config.weeklyData[i + 1].block - config.weeklyData[i].block) / 7);
        for(let days = 0; days < 7; days++) {
          let block = config.weeklyData[i].block + (days * dailyBlockSpacing);
          let time = config.weeklyData[i].timestamp + (days * (week / 7));
          dailyBlocks.push({block, time});
        }
      } else {
        let block = config.weeklyData[i].block;
        let time = config.weeklyData[i].timestamp;
        let estimatedDailyBlockSpacing = Math.floor((config.weeklyData[i].block - config.weeklyData[i - 1].block) / 7);
        let lastBlock = await getCurrentBlock();
        while(block < lastBlock) {
          dailyBlocks.push({block, time});
          block += estimatedDailyBlockSpacing;
          time += week / 7;
        }
      }
    }
  }

  // Setting Up Data:
  config.axialTokens.forEach(token => {
    data[token.symbol] = {
      soldTXs: [],
      boughtTXs: [],
      sold: [],
      bought: []
    };
  });

  // Allocating Daily Data:
  for(let day = 0; day < dailyBlocks.length - 1; day++) {
    let dailyData = {}
    config.axialTokens.forEach(token => {
      dailyData[token.symbol] = {
        soldTXs: 0,
        boughtTXs: 0,
        sold: 0,
        bought: 0
      };
    });
    config.axialPools.forEach(pool => {
      txs[pool.name].forEach(tx => {
        if(tx.block >= dailyBlocks[day].block && tx.block < dailyBlocks[day + 1].block) {
          dailyData[tx.sold.token].soldTXs += 1;
          dailyData[tx.bought.token].boughtTXs += 1;
          dailyData[tx.sold.token].sold += tx.sold.amount;
          dailyData[tx.bought.token].bought += tx.bought.amount;
        }
      });
    });
    config.axialTokens.forEach(token => {
      data[token.symbol].soldTXs.push(dailyData[token.symbol].soldTXs);
      data[token.symbol].boughtTXs.push(dailyData[token.symbol].boughtTXs);
      data[token.symbol].sold.push(Math.floor(dailyData[token.symbol].sold));
      data[token.symbol].bought.push(Math.floor(dailyData[token.symbol].bought));
    });
  }

  // Writing to JSON File:
  writeJSON(data, 'axialDailyTokenVolume');
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
    let week = 0;
    for(let i = 0; i < config.weeklyData.length - 1; i++) {
      if(config.weeklyData[i].block >= config.axialFirstDistribution.block) {
        let volume = 0;
        txs[pool.name].forEach(tx => {
          if(tx.block >= config.weeklyData[i].block && tx.block < config.weeklyData[i + 1].block) {
            volume += tx.sold.amount;
          }
        });
        let entry = values.find(j => j.week === week);
        if(entry) {
          entry.volume += volume;
        } else {
          let time = config.weeklyData[i].timestamp;
          values.push({week, time, volume});
        }
        week++;
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
    for(let i = 0; i < config.weeklyData.length - 1; i++) {
      if(config.weeklyData[i].block >= config.axialFirstDistribution.block) {
        let volume = 0;
        txs[pool.name].forEach(tx => {
          if(tx.block >= config.weeklyData[i].block && tx.block < config.weeklyData[i + 1].block) {
            volume += tx.sold.amount;
          }
        });
        let time = config.weeklyData[i].timestamp;
        weeks.push({time, volume});
      }
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

// Function to get peggies in Axial's Treasury:
const getAxialTreasuryPeggies = async () => {
  let peggies = 0;
  let promises = config.axialTokens.map(token => (async () => {
    let balance = parseInt(await query(token.address, config.minABI, 'balanceOf', [config.axialTreasury]));
    if(balance > 0) {
      peggies += balance / (10 ** token.decimals);
    }
  })());
  await Promise.all(promises);
  console.log('Treasury stablecoin balance loaded...');
  return peggies;
}

/* ====================================================================================================================================================== */

// Function to get unclaimed peggies from pools:
const getUnclaimedPeggies = async () => {
  let values = [];
  let sum = 0;
  let promises = config.axialPools.map(pool => (async () => {
    let amount = 0;
    for(let i = 0; i < pool.tokens.length; i++) {
      amount += parseInt(await query(pool.swap, config.swapABI, 'getAdminBalance', [i])) / (10 ** pool.tokens[i].decimals);
    }
    values.push({name: pool.name, amount});
    sum += amount;
  })());
  await Promise.all(promises);
  values.push({name: 'all', amount: sum});
  values.sort((a, b) => b.amount - a.amount);
  console.log('Unclaimed stablecoin admin fees from pools loaded...');
  return values;
}

/* ====================================================================================================================================================== */

// Function to get sAXIAL token holders:
const getsAXIALHolders = async () => {
  let balances = [];
  let wallets = await query(config.sAXIAL, config.saxialABI, 'getAllUsers', []);
  let promises = wallets.map(wallet => (async () => {
    let balance = parseInt(await query(config.sAXIAL, config.saxialABI, 'getBalance', [wallet])) / (10 ** 18);
    if(balance > 0) {
      balances.push({ wallet, balance });
    }
  })());
  await Promise.all(promises);
  console.log('sAXIAL holders loaded...');
  return balances.sort((a, b) => b.balance - a.balance);
}

/* ====================================================================================================================================================== */

// Function to get veAXIAL token holders:
const getveAXIALHolders = async () => {
  let balances = [];
  let wallets = await query(config.veAXIAL, config.veaxialABI, 'getAllUsers', []);
  let promises = wallets.map(wallet => (async () => {
    let accrued = parseInt(await query(config.veAXIAL, config.veaxialABI, 'getAccrued', [wallet])) / (10 ** 18);
    if(accrued > 0) {
      let staked = parseInt(await query(config.veAXIAL, config.veaxialABI, 'getStaked', [wallet])) / (10 ** 18);
      if(staked > 0) {
        balances.push({ wallet, accrued, staked });
      }
    }
  })());
  await Promise.all(promises);
  console.log('veAXIAL holders loaded...');
  return balances.sort((a, b) => b.accrued - a.accrued);
}

/* ====================================================================================================================================================== */

// Function to get total sAXIAL supply:
const getTotalsAXIALSupply = (saxialHolders) => {
  let sum = 0;
  saxialHolders.forEach(holder => {
    sum += holder.balance;
  });
  return sum;
}

/* ====================================================================================================================================================== */

// Function to get total veAXIAL supply:
const getTotalveAXIALSupply = (veaxialHolders) => {
  let sum = 0;
  veaxialHolders.forEach(holder => {
    sum += holder.accrued;
  });
  return sum;
}

/* ====================================================================================================================================================== */

// Function to fetch all stats:
const fetch = async () => {

  // Adding Banner:
  data += '\n  ===============================\n';
  data += '  ||        AXIAL Stats        ||\n';
  data += '  ===============================\n\n'

  // Full Data:
  if(!basic) {

    // Fetching Data:
    let price = await getPrice();
    let totalSupply = await getTotalSupply();
    let snowballTreasuryBalance = await getTreasuryBalance();
    let axialTreasuryBalance = await getAxialTreasuryBalance();
    let axialTreasuryPeggies = await getAxialTreasuryPeggies();
    let unclaimedTreasuryPeggies = await getUnclaimedPeggies();
    let circulatingSupply = getCirculatingSupply(totalSupply, snowballTreasuryBalance, axialTreasuryBalance);
    let saxialHolders = await getsAXIALHolders();
    let veaxialHolders = await getveAXIALHolders();
    let totalsaxialSupply = getTotalsAXIALSupply(saxialHolders);
    let totalveaxialSupply = getTotalveAXIALSupply(veaxialHolders);
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

    // Writing Data:
    data += `  - AXIAL Price: $${price}\n`;
    data += `  - Total AXIAL Supply: ${totalSupply.toLocaleString(undefined, {maximumFractionDigits: 0})} AXIAL\n`;
    data += `  - AXIAL Market Cap: $${(price * totalSupply).toLocaleString(undefined, {maximumFractionDigits: 0})}\n`;
    data += `  - Treasury: $${((price * axialTreasuryBalance) + axialTreasuryPeggies).toLocaleString(undefined, {maximumFractionDigits: 0})} (${axialTreasuryBalance.toLocaleString(undefined, {maximumFractionDigits: 0})} AXIAL & ${axialTreasuryPeggies.toLocaleString(undefined, {maximumFractionDigits: 0})} Peggies)\n`;
    data += `  - Unclaimed Swap Fees: $${unclaimedTreasuryPeggies[0].amount.toLocaleString(undefined, {maximumFractionDigits: 0})}\n`;
    unclaimedTreasuryPeggies.slice(1).forEach(pool => {
      data += `      > ${pool.name} - $${pool.amount.toLocaleString(undefined, {maximumFractionDigits: 0})}\n`;
    });
    data += `  - Circulating AXIAL Supply: ${circulatingSupply.toLocaleString(undefined, {maximumFractionDigits: 0})} AXIAL (${((circulatingSupply / totalSupply) * 100).toFixed(2)}% of total supply)\n`;
    data += `  - sAXIAL Holders:\n`
    saxialHolders.forEach(holder => {
      data += `      > ${holder.wallet} - ${holder.balance.toLocaleString(undefined, {maximumFractionDigits: 2})} AXIAL (${((holder.balance / totalsaxialSupply) * 100).toFixed(2)}%)\n`;
    });
    data += `  - veAXIAL Holders:\n`
    veaxialHolders.forEach(holder => {
      data += `      > ${holder.wallet} - ${holder.staked.toLocaleString(undefined, {maximumFractionDigits: 2})} AXIAL / ${holder.accrued.toLocaleString(undefined, {maximumFractionDigits: 0})} veAXIAL (${((holder.accrued / totalveaxialSupply) * 100).toFixed(2)}%)\n`;
    });
    data += `  - Total Value Swapped: $${totalSwapped.toLocaleString(undefined, {maximumFractionDigits: 0})} ($${(totalSwapped * 0.0004).toLocaleString(undefined, {maximumFractionDigits: 0})} Swap Fees)\n`;
    poolValueSwapped.forEach(pool => {
      data += `      > ${pool.name} - $${pool.volume.toLocaleString(undefined, {maximumFractionDigits: 0})} ($${(pool.volume * 0.0004).toLocaleString(undefined, {maximumFractionDigits: 0})} Swap Fees)\n`;
    });
    data += `  - Total # of Swap Transactions: ${numTXs.toLocaleString(undefined, {maximumFractionDigits: 0})} TXs\n`;
    poolNumTXs.forEach(pool => {
      data += `      > ${pool.name} - ${pool.txCount.toLocaleString(undefined, {maximumFractionDigits: 0})} TXs\n`;
    });
    data += '  - Weekly Value Swapped:\n';
    weeklyVolume.forEach(item => {
      let rawDate = new Date((item.time) * 1000);
      let date = pad(rawDate.getUTCDate()) + '/' + pad(rawDate.getUTCMonth() + 1) + '/' + rawDate.getUTCFullYear();
      let rawEndDate = new Date((item.time + week - 1) * 1000);
      let endDate = pad(rawEndDate.getUTCDate()) + '/' + pad(rawEndDate.getUTCMonth() + 1) + '/' + rawEndDate.getUTCFullYear();
      data += `      > Week ${(item.week + 1).toLocaleString(undefined, {maximumFractionDigits: 0})} (${date} to ${endDate}) - $${item.volume.toLocaleString(undefined, {maximumFractionDigits: 0})} ($${(item.volume * 0.0004).toLocaleString(undefined, {maximumFractionDigits: 0})} Swap Fees)\n`;
      poolWeeklyVolume.forEach(pool => {
        if(pool.weeks[item.week].volume > 0) {
          data += `        - ${pool.name} - $${pool.weeks[item.week].volume.toLocaleString(undefined, {maximumFractionDigits: 0})} ($${(pool.weeks[item.week].volume * 0.0004).toLocaleString(undefined, {maximumFractionDigits: 0})} Swap Fees)\n`;
        }
      });
    });
    data += '  - Largest Swaps:\n';
    Object.keys(swapStats).forEach(pool => {
      data += `      > ${pool} - $${swapStats[pool].largestSwap.toLocaleString(undefined, {maximumFractionDigits: 0})}\n`;
    });
    data += '  - Average Swap:\n';
    Object.keys(swapStats).forEach(pool => {
      data += `      > ${pool} - $${swapStats[pool].averageSwap.toLocaleString(undefined, {maximumFractionDigits: 0})}\n`;
    });
    data += '  - Swap Size Distribution (Swap % Above):\n';
    Object.keys(swapStats).forEach(pool => {
      data += `      > ${pool} - $1k: ${swapStats[pool].percentages.above1k}%, $5k: ${swapStats[pool].percentages.above5k}%, $10k: ${swapStats[pool].percentages.above10k}%, $25k: ${swapStats[pool].percentages.above25k >= 10 ? swapStats[pool].percentages.above25k : ' ' + swapStats[pool].percentages.above25k}%, $50k: ${swapStats[pool].percentages.above50k}%, $100k: ${swapStats[pool].percentages.above100k}%, $250k: ${swapStats[pool].percentages.above250k}%, $500k: ${swapStats[pool].percentages.above500k}%, $1M: ${swapStats[pool].percentages.above1000k}%\n`;
    });
    data += '  - Token Swap Demand:\n';
    tokenDemand.forEach(item => {
      data += `      > ${item.token} - $${item.demand.toLocaleString(undefined, {maximumFractionDigits: 0})}\n`;
    });
    data += '  - Top 5 Biggest Swappers:\n';
    biggestSwappers.forEach(wallet => {
      data += `      > ${wallet.address} - $${wallet.amount.toLocaleString(undefined, {maximumFractionDigits: 0})} (${wallet.txs.toLocaleString(undefined, {maximumFractionDigits: 0})} TX${wallet.txs > 1 ? 's' : ''}) ${(wallet.address === config.paraswap ? '(ParaSwap Router)' : '')}\n`;
    });

    // Updating Text File:
    writeText(data, 'axialStats');

  // Basic Data (Loads Faster):
  } else {

    // Fetching Data:
    let price = await getPrice();
    let totalSupply = await getTotalSupply();
    let snowballTreasuryBalance = await getTreasuryBalance();
    let axialTreasuryBalance = await getAxialTreasuryBalance();
    let axialTreasuryPeggies = await getAxialTreasuryPeggies();
    let unclaimedTreasuryPeggies = await getUnclaimedPeggies();
    let circulatingSupply = getCirculatingSupply(totalSupply, snowballTreasuryBalance, axialTreasuryBalance);
    let saxialHolders = await getsAXIALHolders();
    let veaxialHolders = await getveAXIALHolders();
    let totalsaxialSupply = getTotalsAXIALSupply(saxialHolders);
    let totalveaxialSupply = getTotalveAXIALSupply(veaxialHolders);

    // Writing Data:
    data += `  - AXIAL Price: $${price}\n`;
    data += `  - Total AXIAL Supply: ${totalSupply.toLocaleString(undefined, {maximumFractionDigits: 0})} AXIAL\n`;
    data += `  - AXIAL Market Cap: $${(price * totalSupply).toLocaleString(undefined, {maximumFractionDigits: 0})}\n`;
    data += `  - Treasury: $${((price * axialTreasuryBalance) + axialTreasuryPeggies).toLocaleString(undefined, {maximumFractionDigits: 0})} (${axialTreasuryBalance.toLocaleString(undefined, {maximumFractionDigits: 0})} AXIAL & ${axialTreasuryPeggies.toLocaleString(undefined, {maximumFractionDigits: 0})} Peggies)\n`;
    data += `  - Unclaimed Swap Fees: $${unclaimedTreasuryPeggies[0].amount.toLocaleString(undefined, {maximumFractionDigits: 0})}\n`;
    unclaimedTreasuryPeggies.slice(1).forEach(pool => {
      data += `      > ${pool.name} - $${pool.amount.toLocaleString(undefined, {maximumFractionDigits: 0})}\n`;
    });
    data += `  - Circulating AXIAL Supply: ${circulatingSupply.toLocaleString(undefined, {maximumFractionDigits: 0})} AXIAL (${((circulatingSupply / totalSupply) * 100).toFixed(2)}% of total supply)\n`;
    data += `  - sAXIAL Holders:\n`
    saxialHolders.forEach(holder => {
      data += `      > ${holder.wallet} - ${holder.balance.toLocaleString(undefined, {maximumFractionDigits: 2})} AXIAL (${((holder.balance / totalsaxialSupply) * 100).toFixed(2)}%)\n`;
    });
    data += `  - veAXIAL Holders:\n`
    veaxialHolders.forEach(holder => {
      data += `      > ${holder.wallet} - ${holder.staked.toLocaleString(undefined, {maximumFractionDigits: 2})} AXIAL / ${holder.accrued.toLocaleString(undefined, {maximumFractionDigits: 0})} veAXIAL (${((holder.accrued / totalveaxialSupply) * 100).toFixed(2)}%)\n`;
    });
  
    // Updating Text File:
    writeText(data, 'axialBasicStats');
  }
}

/* ====================================================================================================================================================== */

// Fetching Data:
fetch();
