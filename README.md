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
- Top 5 richest xSNOB holders.

### Compounder Stats:
- Number of unique wallets that interacted with our compounding strategies. (Not added yet)
- Number of unique wallets that interacted with our compounding strategies in the last 30 days. (Not added yet)
- Number of unique wallets that interacted with our compounding strategies in any given period of time. (Not added yet)

---

## Running Project Locally:

Installing Dependencies:
```
npm i
```

Getting SNOB Stats:
```
npm run snob
```

Getting Compounder Stats:
```
npm run comp
```

If you encounter any RPC errors, wait 5 minutes before trying again. Some of these stats require a lot of calls to be made.