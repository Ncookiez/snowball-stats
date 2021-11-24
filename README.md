# Snowball Stats

Repository to track some token and user stats for Snowball.

---

## Stats Tracked:

### SNOB Stats:

- SNOB price.
- Number of unique wallets holding SNOB.
- SNOB market cap.
- Total SNOB supply.
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
- Total number of SNOB allocation votes.
- Percentage of current SNOB stakers that have voted on SNOB allocations.

```
npm run snob
```

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

### Distribution Stats:

- Total SNOB distributed.
- Average SNOB distribution.
- List of each week's SNOB distribution.
- APR of last SNOB distribution.

```
npm run dist
```

---

If you encounter any RPC errors, wait 5 minutes before trying again, or change the RPC on `config.js`.