# Snowball Stats

Repository to track Snowball statistics.

---

## SNOB Stats

This script grabs a ton of data about Snowball, SNOB, xSNOB and other governance stats.

```
npm run snob
```

The `basic` optional parameter will cover only the simplest queries - getting you results faster.

```
npm run snob basic
```

## NFT Stats

This script grabs ownership data for every one of Snowball's NFTs.

```
npm run nfts
```

## Distribution Stats

This script grabs data on all past xSNOB distributions.

```
npm run dist
```

## Axial Stats

This script grabs a ton of data on Axial, the AXIAL token and the protocol's many pools.

```
npm run axial
```

The `basic` optional parameter will cover only the simplest queries - getting you results faster.

```
npm run axial basic
```

## Axial Distribution Stats

This script checks for any discrepancies between council transactions and AXIAL distributed to xSNOB holders.

```
npm run axialDistCheck
```

## Snowball Pool Contracts

This script will generate JSON and Markdown outputs of Snowball's many auto-compounding pools/strategies.

```
npm run pools
```

## Gas Stats

This script grabs data on how much AVAX is estimated to have been spent as gas on Snowball's many auto-compounding pools/strategies.

```
npm run gasStats
```

## Teddy Stats

This script grabs a ton of data on the Teddy protocol and its TEDDY token.

```
npm run teddy
```

---

You can use `npm run all` to run all scripts. This can take a while.

If you encounter any RPC errors, wait a minute before trying again, or change the RPCs listed on `config.js`.