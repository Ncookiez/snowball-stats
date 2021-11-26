
// Required Packages:
const { ethers } = require('ethers');
const axios = require('axios');

// Required Config Variables:
const config = require('./config.js');

// Setting Up RPCs:
const avax = new ethers.providers.JsonRpcProvider(config.rpc);

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
  let promises = config.axialPools.map(pool => (async () => {
    txs[pool.name] = [];
    let page = 0;
    let hasNextPage = false;
    do {
      try {
        let query = 'https://api.covalenthq.com/v1/43114/address/' + pool.swap + '/transactions_v2/?page-size=1000&page-number=' + page++ + '&key=' + config.ckey;
        let result = await axios.get(query);
        if(!result.data.error) {
          hasNextPage = result.data.data.pagination.has_more;
          let tx_promises = result.data.data.items.map(tx => (async () => {
            if(tx.successful) {
              tx.log_events.forEach(event => {
                if(event.decoded != null && event.decoded.name === 'Transfer' && event.decoded.params[1].value.toLowerCase() === pool.swap.toLowerCase()) {
                  txs[pool.name].push({
                    wallet: event.decoded.params[0].value,
                    time: (new Date(tx.block_signed_at)).getTime() / 1000,
                    amount: event.decoded.params[2].value / (10 ** event.sender_contract_decimals)
                  });
                }
              });
            }
          })());
          await Promise.all(tx_promises);
        } else {
          hasNextPage = false;
        }
      } catch {
        console.log('API ERROR: Covalent is likely down.');
        hasNextPage = false;
      }
    } while(hasNextPage);
    console.log(`${pool.name} transactions loaded...`);
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
      sum += tx.amount;
    });
  });
  return sum;
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
    let sum = 0;
    txs[pool.name].forEach(tx => {
      sum += tx.amount;
    });
    values.push({
      name: pool.name,
      amount: sum
    });
  });
  values.sort((a, b) => b.amount - a.amount);
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
        wallet.amount += tx.amount;
      } else {
        wallets.push({
          address: tx.wallet,
          amount: tx.amount
        });
      }
    });
  });
  wallets.sort((a, b) => b.amount - a.amount);
  return wallets.slice(0, 5);
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
    // <TODO> let weeklyVolume = getWeeklyVolume(txs);
    let poolNumTXs = getPoolNumTXs(txs);
    let poolValueSwapped = getPoolValueSwapped(txs);
    // <TODO> let poolWeeklyVolume = getPoolWeeklyVolume(txs);
    let biggestSwappers = getBiggestSwappers(txs);

    // Printing Data:
    console.log('\n  ===============================');
    console.log('  ||        AXIAL Stats        ||');
    console.log('  ===============================\n');
    console.log('  - AXIAL Price:', '$' + price);
    console.log('  - Total AXIAL Supply:', totalSupply.toLocaleString(undefined, {maximumFractionDigits: 0}), 'AXIAL');
    console.log('  - AXIAL Market Cap:', '$' + (price * totalSupply).toLocaleString(undefined, {maximumFractionDigits: 0}));
    console.log('  - Treasury:', '$' + (price * treasuryBalance).toLocaleString(undefined, {maximumFractionDigits: 0}), '(' + treasuryBalance.toLocaleString(undefined, {maximumFractionDigits: 0}) + ' AXIAL)');
    console.log('  - Axial Treasury:', '$' + (price * axialTreasuryBalance).toLocaleString(undefined, {maximumFractionDigits: 0}), '(' + axialTreasuryBalance.toLocaleString(undefined, {maximumFractionDigits: 0}) + ' AXIAL)');
    console.log('  - Circulating AXIAL Supply:', circulatingSupply.toLocaleString(undefined, {maximumFractionDigits: 0}), 'AXIAL (' + ((circulatingSupply / totalSupply) * 100).toFixed(2) + '% of total supply)');
    console.log('  - Total # of Swap Transactions:', numTXs.toLocaleString(undefined, {maximumFractionDigits: 0}), 'TXs');
    console.log('  - Total Value Swapped:', '$' + totalSwapped.toLocaleString(undefined, {maximumFractionDigits: 0}));
    console.log('  - Pool-Specific # of Swap Transactions:');
    poolNumTXs.forEach(pool => {
      console.log('      >', pool.name, '-', pool.txCount.toLocaleString(undefined, {maximumFractionDigits: 0}), 'TXs');
    });
    console.log('  - Pool-Specific Value Swapped:');
    poolValueSwapped.forEach(pool => {
      console.log('      >', pool.name, '- $' + pool.amount.toLocaleString(undefined, {maximumFractionDigits: 0}));
    });
    console.log('  - Top 5 Biggest Swappers:');
    biggestSwappers.forEach(wallet => {
      console.log('      >', wallet.address, '- $' + wallet.amount.toLocaleString(undefined, {maximumFractionDigits: 0}), (wallet.address === config.paraswap ? '(ParaSwap Router)' : ''));
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
    console.log('  - AXIAL Price:', '$' + price);
    console.log('  - Total AXIAL Supply:', totalSupply.toLocaleString(undefined, {maximumFractionDigits: 0}), 'AXIAL');
    console.log('  - AXIAL Market Cap:', '$' + (price * totalSupply).toLocaleString(undefined, {maximumFractionDigits: 0}));
    console.log('  - Treasury:', '$' + (price * treasuryBalance).toLocaleString(undefined, {maximumFractionDigits: 0}), '(' + treasuryBalance.toLocaleString(undefined, {maximumFractionDigits: 0}) + ' AXIAL)');
    console.log('  - Axial Treasury:', '$' + (price * axialTreasuryBalance).toLocaleString(undefined, {maximumFractionDigits: 0}), '(' + axialTreasuryBalance.toLocaleString(undefined, {maximumFractionDigits: 0}) + ' AXIAL)');
    console.log('  - Circulating AXIAL Supply:', circulatingSupply.toLocaleString(undefined, {maximumFractionDigits: 0}), 'AXIAL (' + ((circulatingSupply / totalSupply) * 100).toFixed(2) + '% of total supply)');
  }
}

/* ====================================================================================================================================================== */

// Fetching Data:
fetch();
