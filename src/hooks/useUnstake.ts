import { useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useAppDispatch } from 'state'
import { updateUserBalance, updateUserPendingReward, updateUserStakedBalance } from 'state/actions'
import { exit, sousEmergencyUnstake, sousUnstake, unstake, unstakeGamefi } from 'utils/callHelpers'
import { useLPStakingContract, useMasterchef, useSousChef, useGamefiContract } from './useContract'

export const useExit = (contract: string) => {
  const { account } = useWeb3React()
  const stakingContract = useLPStakingContract(contract)

  const handleUnstake = useCallback(
    async (amount: string) => {
      const txHash = await exit(stakingContract, account)
      console.info(txHash)
    },
    [account, stakingContract],
  )

  return { onUnstake: handleUnstake }
}

const useUnstake = (pid: number) => {
  const { account } = useWeb3React()
  const masterChefContract = useMasterchef()

  const handleUnstake = useCallback(
    async (amount: string) => {
      const txHash = await unstake(masterChefContract, pid, amount, account)
      console.info(txHash)
    },
    [account, masterChefContract, pid],
  )

  return { onUnstake: handleUnstake }
}

export const useSousUnstake = (sousId, enableEmergencyWithdraw = false) => {
  const dispatch = useAppDispatch()
  const { account } = useWeb3React()
  const masterChefContract = useMasterchef()
  const sousChefContract = useSousChef(sousId)

  const handleUnstake = useCallback(
    async (amount: string, decimals: number) => {
      if (sousId === 0) {
        const txHash = await unstake(masterChefContract, 0, amount, account)
        console.info(txHash)
      } else if (enableEmergencyWithdraw) {
        const txHash = await sousEmergencyUnstake(sousChefContract, account)
        console.info(txHash)
      } else {
        const txHash = await sousUnstake(sousChefContract, amount, decimals, account)
        console.info(txHash)
      }
      dispatch(updateUserStakedBalance(sousId, account))
      dispatch(updateUserBalance(sousId, account))
      dispatch(updateUserPendingReward(sousId, account))
    },
    [account, dispatch, enableEmergencyWithdraw, masterChefContract, sousChefContract, sousId],
  )

  return { onUnstake: handleUnstake }
}

export const useGamefiUnstake = (sousId: number, contractAddress: string ) => {
  const dispatch = useAppDispatch()
  const { account } = useWeb3React()
  const gamefiContract = useGamefiContract(contractAddress)

  const handleUnstake = useCallback(
    async (id: number) => {
      const txHash = await unstakeGamefi(gamefiContract, account, id)
      console.info(txHash)
    },
    [account, gamefiContract]
  )

  dispatch(updateUserStakedBalance(sousId, account))
  dispatch(updateUserBalance(sousId, account))
  dispatch(updateUserPendingReward(sousId, account))

  return { onGamefiUnstake: handleUnstake }
}

export default useUnstake
