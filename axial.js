
// Required Packages:
const { ethers } = require('ethers');
const axios = require('axios');

// Required Config Variables:
const config = require('./config.js');

// Setting Up RPCs:
const avax = new ethers.providers.JsonRpcProvider(config.rpc);

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
  console.log('Axial\'s Treasury balance loaded...');
  return treasuryBalance / (10 ** 18);
}

/* ====================================================================================================================================================== */

// Function to get circulating AXIAL supply:
const getCirculatingSupply = (total, treasury, axialTreasury) => {
  let circulatingSupply = total - treasury - axialTreasury;
  return circulatingSupply;
}

/* ====================================================================================================================================================== */

// Function to fetch all stats:
const fetch = async () => {

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

/* ====================================================================================================================================================== */

// Fetching Data:
fetch();
