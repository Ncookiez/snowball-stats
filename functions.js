
// Required Packages:
const { ethers } = require('ethers');
const axios = require('axios');
const fs = require('fs');
const config = require('./config.js');

// Setting Up RPCs:
const avax = new ethers.providers.JsonRpcProvider(config.rpc);
const avax_backup = new ethers.providers.JsonRpcProvider(config.rpc_backup);

/* ====================================================================================================================================================== */

// Function to make blockchain queries:
exports.query = async (address, abi, method, args) => {
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

// Function to query blocks for a specific type of event:
exports.queryBlocks = async (address, abi, event, startBlock, querySize) => {
  let results = [];
  let currentBlock = await avax.getBlockNumber();
  let contract = new ethers.Contract(address, abi, avax);
  let backupContract = new ethers.Contract(address, abi, avax_backup);
  let eventFilter = contract.filters[event]();
  let backupEventFilter = backupContract.filters[event]();
  let lastQueriedBlock = startBlock;
  try {
    while(++lastQueriedBlock < currentBlock) {
      let targetBlock = Math.min(lastQueriedBlock + querySize, currentBlock);
      let result;
      while(!result) {
        try {
          result = await contract.queryFilter(eventFilter, lastQueriedBlock, targetBlock);
        } catch {
          try {
            result = await backupContract.queryFilter(backupEventFilter, lastQueriedBlock, targetBlock);
          } catch {
            console.log(`RPC WARNING: Retrying block ${lastQueriedBlock} query...`);
          }
        }
      }
      results.push(...result);
      lastQueriedBlock = targetBlock;
    }
  } catch(err) {
    console.error(err);
    process.exit(1);
  }
  return results;
}

/* ====================================================================================================================================================== */

// Function to get token price from CoinGecko:
exports.getTokenPrice = async (token) => {
  try {
    let price = (await axios.get(`https://api.coingecko.com/api/v3/simple/token_price/avalanche?contract_addresses=${token}&vs_currencies=usd`)).data[token.toLowerCase()].usd;
    return price;
  } catch(err) {
    console.error(err);
    process.exit(1);
  }
}

/* ====================================================================================================================================================== */

// Function to fetch data from Snowball API:
exports.fetchDataAPI = async (data) => {
  let url = 'https://api.snowapi.net/graphql';
  let method = 'post';
  try {
    let pools = (await axios({url, method, data})).data.data.SnowglobeContracts;
    return pools;
  } catch(err) {
    console.error(err);
    process.exit(1);
  }
}

/* ====================================================================================================================================================== */

// Function to write data to text file:
exports.writeText = (data, file) => {
  fs.writeFile(`./outputs/${file}.txt`, data, 'utf8', (err) => {
    if(err) {
      console.error(err);
      process.exit(1);
    }
  });
}

/* ====================================================================================================================================================== */

// Function to write data to JSON file:
exports.writeJSON = (data, file) => {
  fs.writeFile(`./outputs/${file}.json`, JSON.stringify(data, null, ' '), 'utf8', (err) => {
    if(err) {
      console.error(err);
      process.exit(1);
    }
  });
}

/* ====================================================================================================================================================== */

// Function to format Markdown table:
exports.formatTable = (tableData) => {
  let table = '';
  let columns = tableData[0].length;
  for(let i = 0; i < columns; i++) {
    table += tableData[0][i];
    if(i < columns - 1) {
      table += ' | ';
    } else {
      table += '\n';
    }
  }
  for(let i = 0; i < columns; i++) {
    table += '---';
    if(i < columns - 1) {
      table += ' | ';
    } else {
      table += '\n';
    }
  }
  tableData.slice(1).forEach(row => {
    for(let i = 0; i < columns; i++) {
      table += row[i];
      if(i < columns - 1) {
        table += ' | ';
      } else {
        table += '\n';
      }
    }
  });
  return table;
}

/* ====================================================================================================================================================== */

// Function to pad date if necessary:
exports.pad = (num) => {
  let str = num.toString();
  if(str.length < 2) {
    return '0' + str;
  } else {
    return str;
  }
}