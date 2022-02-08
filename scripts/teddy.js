
// Required Packages:
const { query, writeText, getTokenPrice, getNativeTokenPrice, getTokenHolders } = require('../functions.js');
const config = require('../config.js');

// Initializations:
let data = '';

/* ====================================================================================================================================================== */

// Function to get TEDDY Price:
const getPrice = async () => {
  let price = await getTokenPrice(config.teddy);
  console.log('TEDDY price loaded...');
  return price.toFixed(4);
}

/* ====================================================================================================================================================== */

// Function to get total TEDDY supply:
const getTotalSupply = async () => {
  let supplyNotIssued = parseInt(await query(config.teddy, config.minABI, 'balanceOf', [config.teddyIssuance]));
  console.log('TEDDY supply loaded...');
  return 82000000 - (supplyNotIssued / (10 ** 18));
}

/* ====================================================================================================================================================== */

// Function to get # of TEDDY holders:
const getHolders = async () => {
  let holders = (await getTokenHolders(config.teddy)).length;
  console.log('TEDDY holders loaded...');
  return holders;
}

/* ====================================================================================================================================================== */

// Function to get staked TEDDY supply:
const getStaked = async () => {
  let balance = parseInt(await query(config.teddy, config.minABI, 'balanceOf', [config.teddyStaking]));
  console.log('Staked TEDDY supply loaded...');
  return balance / (10 ** 18);
}

/* ====================================================================================================================================================== */

// Function to get TSD Price:
const getDollarPrice = async () => {
  let price = await getTokenPrice(config.tsd);
  console.log('TSD price loaded...');
  return price.toFixed(2);
}

/* ====================================================================================================================================================== */

// Function to get total TSD supply:
const getDollarTotalSupply = async () => {
  let supply = await query(config.tsd, config.minABI, 'totalSupply', []);
  console.log('TSD supply loaded...');
  return supply / (10 ** 18);
}

/* ====================================================================================================================================================== */

// Function to get # of TSD holders:
const getDollarHolders = async () => {
  let holders = (await getTokenHolders(config.tsd)).length;
  console.log('TSD holders loaded...');
  return holders;
}

/* ====================================================================================================================================================== */

// Function to get staked TSD supply:
const getDollarStaked = async () => {
  let balance = parseInt(await query(config.tsd, config.minABI, 'balanceOf', [config.stabilityPool]));
  console.log('Staked TSD supply loaded...');
  return balance / (10 ** 18);
}

/* ====================================================================================================================================================== */

// Function to get AVAX Price:
const getNativePrice = async () => {
  let price = await getNativeTokenPrice();
  console.log('AVAX price loaded...');
  return price.toFixed(4);
}

/* ====================================================================================================================================================== */

// Function to get AVAX collateral:
const getCollateral = async () => {
  let balance = parseInt(await query(config.troves, config.troveManagerABI, 'getEntireSystemColl', []));
  console.log('AVAX collateral loaded...');
  return balance / (10 ** 18);
}

/* ====================================================================================================================================================== */

// Function to get trove data:
const getTroves = async (avaxPrice) => {
  let numTroves = parseInt(await query(config.sortedTroves, config.sortedTrovesABI, 'getSize', []));
  let troves = [];
  let troveIDs = [...Array(numTroves).keys()];
  let promises = troveIDs.map(troveID => (async () => {
    let troveOwner = await query(config.troves, config.troveManagerABI, 'TroveOwners', [troveID]);
    let troveData = await query(config.troves, config.troveManagerABI, 'Troves', [troveOwner]);
    troves.push({
      owner: troveOwner,
      collateral: parseInt(troveData.coll) / (10 ** 18),
      debt: parseInt(troveData.debt) / (10 ** 18),
      ratio: ((parseInt(troveData.coll) * avaxPrice) / parseInt(troveData.debt)) * 100
    });
  })());
  await Promise.all(promises);
  troves.sort((a, b) => b.collateral - a.collateral);
  console.log('Troves loaded...');
  return troves;
}

/* ====================================================================================================================================================== */

// Function to fetch all stats:
const fetch = async () => {

  // Adding Banner:
  data += '\n  =============================\n';
  data += '  ||       TEDDY Stats       ||\n';
  data += '  =============================\n\n';

  // Fetching Data:
  let price = await getPrice();
  // let totalSupply = await getTotalSupply();
  let holders = await getHolders();
  let staked = await getStaked();
  let dollarPrice = await getDollarPrice();
  let dollarTotalSupply = await getDollarTotalSupply();
  let dollarHolders = await getDollarHolders();
  let dollarStaked = await getDollarStaked();
  let avaxPrice = await getNativePrice();
  let avaxCollateral = await getCollateral();
  let troves = await getTroves(avaxPrice);

  // Writing Data:
  data += `  - TEDDY Price: $${price}\n`;
  // data += `  - Total TEDDY Supply: ${totalSupply.toLocaleString(undefined, {maximumFractionDigits: 0})} TEDDY\n`;
  // data += `  - TEDDY Market Cap: $${(price * totalSupply).toLocaleString(undefined, {maximumFractionDigits: 0})}\n`;
  data += `  - TEDDY Holders: ${holders.toLocaleString(undefined, {maximumFractionDigits: 0})} Users\n`;
  // data += `  - Staked TEDDY: ${staked.toLocaleString(undefined, {maximumFractionDigits: 0})} TEDDY (${((staked / totalSupply) * 100).toFixed(2)}% of total supply)\n`;
  data += `  - Staked TEDDY: ${staked.toLocaleString(undefined, {maximumFractionDigits: 0})} TEDDY\n`; // <TODO> REMOVE AFTER FIXING TEDDY SUPPLY
  data += `  - TSD Price: $${dollarPrice}\n`;
  data += `  - Total TSD Supply: ${dollarTotalSupply.toLocaleString(undefined, {maximumFractionDigits: 0})} TSD\n`;
  data += `  - TSD Holders: ${dollarHolders.toLocaleString(undefined, {maximumFractionDigits: 0})} Users\n`;
  data += `  - Staked TSD: ${dollarStaked.toLocaleString(undefined, {maximumFractionDigits: 0})} TSD (${((dollarStaked / dollarTotalSupply) * 100).toFixed(2)}% of total supply)\n`;
  data += `  - AVAX Collateral: ${avaxCollateral.toLocaleString(undefined, {maximumFractionDigits: 0})} AVAX ($${(avaxCollateral * avaxPrice).toLocaleString(undefined, {maximumFractionDigits: 0})})\n`;
  data += `  - Collateral Ratio: ${(((avaxCollateral * avaxPrice) / dollarTotalSupply) * 100).toFixed(2)}%\n`;
  data += `  - Trove Count: ${troves.length}\n`;
  data += '  - Top 5 Largest Troves By Collateral:\n';
  troves.slice(0, 5).forEach(trove => {
    data += `      > ${trove.owner} - ${trove.collateral.toLocaleString(undefined, {maximumFractionDigits: 0})} AVAX (${trove.debt.toLocaleString(undefined, {maximumFractionDigits: 0})} TSD Minted) - Ratio: ${(((trove.collateral * avaxPrice) / trove.debt) * 100).toFixed(2)}%\n`;
  });
  data += '  - Top 5 Riskiest Troves By Collateral Ratio:\n';
  troves.sort((a, b) => a.ratio - b.ratio).slice(0, 5).forEach(trove => {
    data += `      > ${trove.owner} - ${trove.collateral.toLocaleString(undefined, {maximumFractionDigits: 0})} AVAX (${trove.debt.toLocaleString(undefined, {maximumFractionDigits: 0})} TSD Minted) - Ratio: ${(((trove.collateral * avaxPrice) / trove.debt) * 100).toFixed(2)}%\n`;
  });
  data += `  - Average Trove Collateral: ${(avaxCollateral / troves.length).toLocaleString(undefined, {maximumFractionDigits: 0})} AVAX\n`;
  data += `  - Average Trove TSD Minted: ${(dollarTotalSupply / troves.length).toLocaleString(undefined, {maximumFractionDigits: 0})} TSD\n`;

  // Updating Text File:
  writeText(data, 'teddyStats');
}

/* ====================================================================================================================================================== */

// Fetching Data:
fetch();
