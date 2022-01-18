
// Required Packages:
const axios = require('axios');
const fs = require('fs');
const config = require('../config.js');

// Initializations:
let data = '';

/* ====================================================================================================================================================== */

// Function to get NFT holders:
const getHolders = async () => {
  let nftHolders = [];
  let promises = config.nfts.map(nft => (async () => {
    let data = {
      name: nft.name,
      address: nft.address,
      holders: []
    };
    let query = 'https://api.covalenthq.com/v1/43114/tokens/' + nft.address + '/token_holders/?page-size=10000&key=' + config.ckey;
    let result = await axios.get(query);
    result.data.data.items.forEach(holder => {
      if(!config.nftMarketplaces.includes(holder.address.toLowerCase())) {
        data.holders.push({ address: holder.address, balance: holder.balance });
      }
    });
    nftHolders.push(data);
    console.log(`${nft.name} NFT Holders loaded...`);
  })());
  await Promise.all(promises);

  // Writing to JSON File (OPTIONAL):
  // fs.writeFile('./nftHolders.json', JSON.stringify(nftHolders), 'utf8', (err) => {
  //   if(err) {
  //     console.log('Error writing to JSON file:', err);
  //   } else {
  //     console.log('Successfully wrote to JSON file.');
  //   }
  // });

  return nftHolders;
}

/* ====================================================================================================================================================== */

// Function to write data to text file:
const writeText = (data, file) => {
  fs.writeFile(`./outputs/${file}.txt`, data, 'utf8', (err) => {
    if(err) {
      console.error(err);
    } else {
      console.info(`Successfully updated ${file}.txt.`);
    }
  });
}

/* ====================================================================================================================================================== */

// Function to fetch all stats:
const fetch = async () => {

  // Adding Banner:
  data += '\n  ===============================\n';
  data += '  ||         NFT Stats         ||\n';
  data += '  ===============================\n\n'

  // Fetching Data:
  let holders = await getHolders();

  // Writing Data:
  data += '  - NFT Holders:\n';
  holders.forEach(nft => {
    data += `      > ${nft.name} (${nft.address}):\n`;
    nft.holders.forEach(user => {
      data += `        - ${user.address} (${user.balance} NFT${user.balance > 1 ? 's' : ''})\n`;
    });
  });

  // Updating Text File:
  writeText(data, 'nftStats');
}

/* ====================================================================================================================================================== */

// Fetching Data:
fetch();
