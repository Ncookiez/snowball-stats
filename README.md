# Snowball Stats

Repository to track Snowball statistics.

---

## Stats Tracked:

### SNOB Stats:

- SNOB price.
- Number of unique wallets holding SNOB.
- Total SNOB supply.
- SNOB market cap.
- Treasury SNOB balance.
- Locked / staked SNOB supply.
- Circulating SNOB supply.
- Number of unique wallets staking SNOB.
- Average SNOB amount staked.
- Average SNOB locked time.
- Total xSNOB supply.
- Average xSNOB amount held by stakers.
- Number of wallets with at least 100k xSNOB.
- Number of users forgetting to withdraw their unlocked SNOB.
- Amount of unlocked SNOB waiting to be withdrawn.
- Amount of unclaimed SNOB rewards from xSNOB holders.
- Amount of unclaimed AXIAL rewards from xSNOB holders.
- Top 5 richest xSNOB holders.
- Number of SNOB allocation voters.
- Number of proposal voters.
- Total number of SNOB allocation votes.
- Total number of proposal votes.
- Percentage of current SNOB stakers that have voted on SNOB allocations or governance proposals.
- Participation and results of each governance proposal.

```
npm run snob
```

```
npm run snob basic
```

Entering the `basic` optional parameter will only run some of the simplest queries. This script will run very quickly.

### Compounder Stats (WIP):

- Number of unique wallets that interacted with our compounding strategies.
- Number of unique wallets that interacted with our compounding strategies in the last 30 days.
- Number of unique wallets that interacted with our compounding strategies in any given period of time.

```
npm run comp
```

```
npm run comp <start_time> <end_time>
```

Entering only a start time but not an end time is also an option. The current time will be used for the end time.

You can use the link [here](https://www.unixtimestamp.com/) to get Unix timestamps.

### NFT Stats:

- Owners of each Snowball NFT.

```
npm run nfts
```

### Distribution Stats:

- Total SNOB distributed.
- Average SNOB distribution.
- Total AXIAL distributed.
- Average AXIAL distribution.
- List of each week's SNOB and AXIAL distribution.
- APR of last SNOB and AXIAL distribution.
- All-time staking APR.

```
npm run dist
```

### Axial Stats:

- AXIAL price.
- Total AXIAL supply.
- AXIAL market cap.
- Treasury AXIAL balance.
- Treasury stablecoin balance.
- Unclaimed treasury swap fees from each pool.
- Circulating AXIAL supply.
- Total number of swap transactions.
- Total all-time volume traded.
- Weekly volume traded.
- Number of swap transactions on each pool.
- All-time volume traded on each pool.
- Weekly volume traded on each pool.
- Top 5 biggest swappers' volume traded.
- Top 5 biggest swappers' number of transactions.
- Swap fees accrued weekly or per-pool basis.
- Demand for each token through swaps.
- Largest swap for each pool.
- Average swap for each pool.
- Swap volume distribution for each pool.

```
npm run axial
```

```
npm run axial basic
```

Entering the `basic` optional parameter will only run some of the simplest queries. This script will run very quickly.

### Snowball Pool Contracts:

- List of all data on Snowball pool contracts used for auto-compounding.
- JSON output of this data.
- Markdown output of this data.
- JSON output of any errored pools, pools that need to be deprecated, etc.

```
npm run pools
```

---

If you encounter any RPC errors, wait a minute before trying again, or change the RPCs listed on `config.js`.