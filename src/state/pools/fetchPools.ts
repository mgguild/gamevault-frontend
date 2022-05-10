import BigNumber from 'bignumber.js'
import poolsConfig from 'config/constants/pools'
import sousChefABI from 'config/abi/sousChef.json'
import wbnbABI from 'config/abi/weth.json'
import sousChefV2 from 'config/abi/sousChefV2.json'
import multicall from 'utils/multicall'
import { getAddress, getWbnbAddress } from 'utils/addressHelpers'
import { BIG_ZERO } from 'utils/bigNumber'
import { getSouschefV2Contract } from 'utils/contractHelpers'

export const fetchPoolsBlockLimits = async () => {
  const poolsWithEnd = poolsConfig.filter((p) => p.sousId !== 0)
  const callsStartBlock = poolsWithEnd.map((poolConfig) => {
    return {
      address: getAddress(poolConfig.contractAddress),
      name: 'startBlock',
    }
  })
  const callsEndBlock = poolsWithEnd.map((poolConfig) => {
    return {
      address: getAddress(poolConfig.contractAddress),
      name: 'bonusEndBlock',
    }
  })

  // commented out for testnet
  // const starts = await multicall(sousChefABI, callsStartBlock)
  // const ends = await multicall(sousChefABI, callsEndBlock)

  return poolsWithEnd.map((cakePoolConfig, index) => {
    const startBlock = '0x011025c8' // hard coded for testnet
    const endBlock = '0x011025c8' // hard coded for testnet
    return {
      sousId: cakePoolConfig.sousId,
      startBlock: new BigNumber(startBlock).toJSON(),
      endBlock: new BigNumber(endBlock).toJSON(),
    }
  })
}

export const fetchPoolsTotalStaking = async () => {
  const nonBnbPools = poolsConfig.filter((p) => p.stakingToken.symbol !== 'BNB')
  const bnbPool = poolsConfig.filter((p) => p.stakingToken.symbol === 'BNB')

  const callsNonBnbPools = nonBnbPools.map((poolConfig) => {
    return {
      address: getAddress(poolConfig.contractAddress),
      name: 'totalDeposit',
      params: [],
    }
  })

  const callsBnbPools = bnbPool.map((poolConfig) => {
    return {
      address: getWbnbAddress(),
      name: 'balanceOf',
      params: [getAddress(poolConfig.contractAddress)],
    }
  })

  // commented out for testnet
  // const nonBnbPoolsTotalStaked = await multicall(sousChefV2, callsNonBnbPools)
  const bnbPoolsTotalStaked = [] // hard coded for testnet

  return [
    ...nonBnbPools.map((p, index) => ({
      sousId: p.sousId,
      totalStaked: new BigNumber('0x032fbf4ce723462e3274b7').toJSON(),
    })),
    ...bnbPool.map((p, index) => ({
      sousId: p.sousId,
      totalStaked: new BigNumber(bnbPoolsTotalStaked[index]).toJSON(),
    })),
  ]
}

export const fetchPoolStakingLimit = async (sousId: number): Promise<BigNumber> => {
  try {
    const sousContract = getSouschefV2Contract(sousId)
    const stakingLimit = await sousContract.methods.poolLimitPerUser().call()
    return new BigNumber(stakingLimit)
  } catch (error) {
    return BIG_ZERO
  }
}

export const fetchPoolsStakingLimits = async (
  poolsWithStakingLimit: number[],
): Promise<{ [key: string]: BigNumber }> => {
  const validPools = poolsConfig
    .filter((p) => p.stakingToken.symbol !== 'BNB' && !p.isFinished)
    .filter((p) => !poolsWithStakingLimit.includes(p.sousId))

  // Get the staking limit for each valid pool
  // Note: We cannot batch the calls via multicall because V1 pools do not have "poolLimitPerUser" and will throw an error
  const stakingLimitPromises = validPools.map((validPool) => fetchPoolStakingLimit(validPool.sousId))
  const stakingLimits = await Promise.all(stakingLimitPromises)

  return stakingLimits.reduce((accum, stakingLimit, index) => {
    return {
      ...accum,
      [validPools[index].sousId]: stakingLimit,
    }
  }, {})
}

export const fetchPoolStakingTiers = async () => {
  console.log('FETCH TIER 1');
  const poolsWithEnd = poolsConfig.filter((p) => p.sousId !== 0)

  const getTier1 = poolsWithEnd.map((poolConfig) => {
    return {
      address: getAddress(poolConfig.contractAddress),
      name: 'tierInfo',
      params: [1],
    }
  })

  const getTier2 = poolsWithEnd.map((poolConfig) => {
    return {
      address: getAddress(poolConfig.contractAddress),
      name: 'tierInfo',
      params: [2],
    }
  })

  const getTier3 = poolsWithEnd.map((poolConfig) => {
    return {
      address: getAddress(poolConfig.contractAddress),
      name: 'tierInfo',
      params: [3],
    }
  })

  const getTier4 = poolsWithEnd.map((poolConfig) => {
    return {
      address: getAddress(poolConfig.contractAddress),
      name: 'tierInfo',
      params: [4],
    }
  })


  const tier1 = await multicall(sousChefABI, getTier1)
  const tier2 = await multicall(sousChefABI, getTier2)
  const tier3 = await multicall(sousChefABI, getTier3)
  const tier4 = await multicall(sousChefABI, getTier4)

  return poolsWithEnd.map((cakePoolConfig, index) => {
    return {
      sousId: cakePoolConfig.sousId,
      stakeTiers:{
        tier1: {duration: new BigNumber(tier1[index][0]._hex).toJSON(), apyPerSec: new BigNumber(tier1[index][1]._hex).toJSON()},
        tier2: {duration: new BigNumber(tier2[index][0]._hex).toJSON(), apyPerSec: new BigNumber(tier1[index][1]._hex).toJSON()},
        tier3: {duration: new BigNumber(tier3[index][0]._hex).toJSON(), apyPerSec: new BigNumber(tier1[index][1]._hex).toJSON()},
        tier4: {duration: new BigNumber(tier4[index][0]._hex).toJSON(), apyPerSec: new BigNumber(tier1[index][1]._hex).toJSON()},
      }
    }
  })
}
