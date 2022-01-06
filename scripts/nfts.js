
// Required Packages:
const axios = require('axios');
const fs = require('fs');

// Required Config Variables:
const config = require('../config.js');

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

  // Writing JSON File (OPTIONAL):
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

// Function to fetch all stats:
const fetch = async () => {

  // Fetching Data:
  let holders = await getHolders();

  // Printing Data:
  console.log('\n  ===============================');
  console.log('  ||         NFT Stats         ||');
  console.log('  ===============================\n');
  console.log('  - NFT Holders:');
  holders.forEach(nft => {
    console.log(`      > ${nft.name} (${nft.address}):`);
    nft.holders.forEach(user => {
      console.log(`        - ${user.address} (${user.balance} NFT${user.balance > 1 ? 's' : ''})`);
    });
  });
}

/* ====================================================================================================================================================== */

// Fetching Data:
fetch();
