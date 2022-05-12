import React, { Dispatch, SetStateAction, useState, useContext, useMemo, useCallback, useEffect } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { Grid } from '@mui/material'
import { Flex, Text, Button, Input, useModal } from '@metagg/mgg-uikit'
import { FarmWithStakedValue } from 'views/Gamefi/components/config'
import BigNumber from 'bignumber.js'
import { getBalanceNumber, toBigNumber } from 'utils/formatBalance'
import { Pool } from 'state/types'
import { BIG_ZERO } from 'utils/bigNumber'
import { EPOCH_PER_YEAR, EPOCH_PER_DAY } from 'config'
import { useSousApprove, useSousApproveWithAmount } from 'hooks/useApprove'
import useToast from 'hooks/useToast'
import UnlockButton from 'components/UnlockButton'
import StakeModal from './Modals/StakeModal'

BigNumber.config({
  DECIMAL_PLACES: 4,
  FORMAT: {
    decimalSeparator: '.',
    groupSeparator: ',',
    groupSize: 3,
  },
})

const ButtonSM = styled(Button)`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  height: 2.5rem;
  border-radius: 4px;
`

const StyledDetails = styled(Flex)`
  width: 100%;
  flex-direction: column;
  & > * {
    justify-content: space-between;
    flex: 1;
    & :first-child {
      color: ${({ theme }) => theme.colors.textSubtle};
    }
  }
`

interface ComponentProps {
  dayDuration: string
  dayFunction: Dispatch<SetStateAction<string>>
  APYFunction: Dispatch<SetStateAction<string>>
  currentFarm?: FarmWithStakedValue
  stakingType: string
  currentPoolBased?: Pool
  account?: any
}

const intoDays = (seconds: string) => {
  return new BigNumber(seconds).div(new BigNumber(EPOCH_PER_DAY)).toJSON()
}

const Component: React.FC<ComponentProps> = ({
  dayDuration,
  dayFunction,
  APYFunction,
  currentFarm,
  currentPoolBased,
  stakingType,
  account,
}) => {
  const theme = useContext(ThemeContext)
  const { toastSuccess, toastError, toastWarning } = useToast()
  const pairSymbol = stakingType === 'farm' ? currentFarm.lpSymbol : currentPoolBased.stakingToken.symbol
  const currentStake = stakingType === 'farm' ? currentFarm : currentPoolBased

  // const userTotalStaked = currentStake.userData ? new BigNumber(getBalanceNumber(new BigNumber(currentStake.userData.stakedBalance), currentStake.stakingToken.decimals)) : BIG_ZERO
  // const userStakingBal  = currentStake.userData ? new BigNumber(getBalanceNumber(new BigNumber(currentStake.userData.stakingTokenBalance), currentStake.stakingToken.decimals)) : BIG_ZERO
  // const userAllowance   = currentStake.userData ? new BigNumber(getBalanceNumber(new BigNumber(currentStake.userData.allowance), currentStake.stakingToken.decimals)) : BIG_ZERO

  const {userTotalStaked, userStakingBal, userAllowance} = useMemo(() => {
    return {
      userTotalStaked: currentStake.userData ? new BigNumber(getBalanceNumber(new BigNumber(currentStake.userData.stakedBalance), currentStake.stakingToken.decimals)) : BIG_ZERO,
      userStakingBal: currentStake.userData ? new BigNumber(getBalanceNumber(new BigNumber(currentStake.userData.stakingTokenBalance), currentStake.stakingToken.decimals)) : BIG_ZERO,
      userAllowance: currentStake.userData ? new BigNumber(getBalanceNumber(new BigNumber(currentStake.userData.allowance), currentStake.stakingToken.decimals)) : BIG_ZERO,
    }
  }, [currentStake])

  const [tierId, setTierId] = useState(null)
  const [stakeAmount, setTknStake] = useState('')
  const [percentage, setPercentage] = useState('0.0')
  const [estimatedProfit, setEstimatedProfit] = useState('-')

  const tiersDuration = useMemo(() => Object.keys(currentStake.tiers).map((tier) => {
    return intoDays(currentStake.tiers[tier].duration)
  }), [currentStake])

  const APYs = useMemo(() => Object.keys(currentStake.tiers).map((tier) => {
    return getBalanceNumber(new BigNumber(currentStake.tiers[tier].apyPerSec).times(new BigNumber(EPOCH_PER_YEAR)), currentStake.stakingToken.decimals).toFixed(0)
  }), [currentStake])

  const handleChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      if (e.currentTarget.validity.valid) {
        const val = e.currentTarget.value.replace(/,/g, '.')
        setTknStake(val)
        setEstimatedProfit(new BigNumber(val).multipliedBy(new BigNumber(percentage)).toString())
      }
    },
    [setTknStake, percentage],
  )

  const handleTierChange = useCallback((index: number) => {
    dayFunction(tiersDuration[index]);
    APYFunction(APYs[index])
    setTierId(index)
    setPercentage(new BigNumber(APYs[index]).div(new BigNumber(100)).toString())
  },
  [ // dependencies
    dayFunction,
    APYFunction,
    tiersDuration,
    setPercentage,
    setTierId,
    APYs
  ])

  const [onPresentStakeAction] = useModal(
    <StakeModal
      stakingType={stakingType}
      currentStake={currentStake}
      pairSymbol={pairSymbol}
      duration={tiersDuration[tierId]}
      APY={APYs[tierId]}
      maxFine={currentStake.maxFine}
      stakeAmount={stakeAmount}
      estimatedProfit={estimatedProfit}
      userTotalStaked={userTotalStaked}
      userStakingBal={userStakingBal}
      userAllowance={userAllowance}
    />
  )

  const handleStakeClick = useCallback(() => {
    if(!userStakingBal.lte(new BigNumber(stakeAmount))){
      onPresentStakeAction()
    }else{
      toastWarning('Insufficient balance!', 'Staking amount is greater then your current balance')
    }
  },
  [onPresentStakeAction, toastWarning, stakeAmount, userStakingBal])

  return (
    <>
      <Flex justifyContent="center" style={{ width: '100%' }}>
        <Grid container spacing={{ xs: 2, md: 1 }} justifyContent="center">
          {[0, 1, 2, 3].map((index) => (
            <>
              <Grid key={index} item xs={12} sm={3} md={3}>
                <ButtonSM fullWidth onClick={() => handleTierChange(index)}>
                  {`${tiersDuration[index]} Days`}
                </ButtonSM>
              </Grid>
            </>
          ))}
        </Grid>
      </Flex>
      <StyledDetails>

        <hr style={{ width: '100%' }} />
        <Flex>
          <Text>Your total stakes</Text>
          <Text>{userTotalStaked.toFormat()} {pairSymbol}</Text>
        </Flex>
        <Flex>
          <Text>Your balance</Text>
          <Text>{userStakingBal.toFormat()} {pairSymbol}</Text>
        </Flex>
        {/* <Flex>
          <Text>Total staked</Text>
          <Text>10000.00 {pairSymbol}</Text>
        </Flex> */}
      </StyledDetails>
      <Flex style={{ flex: '0 50%' }}>
        <Text>Amount</Text>
      </Flex>
      <Flex style={{ flex: '0 50%', justifyContent: 'end' }}>
        <ButtonSM>Deposit Max</ButtonSM>
      </Flex>
      <Flex style={{ flex: '0 100%', position: 'relative' }}>
        <Input
          pattern={`^[0-9]*[.,]?[0-9]{0,${18}}$`}
          inputMode="decimal"
          step="any"
          min="0"
          value={stakeAmount}
          onChange={handleChange}
          style={{ padding: '1.5rem' }}
          placeholder="0" type="number"
        />
        <div style={{ position: 'absolute', top: '0.7rem', right: '1.5rem' }}>
          <Text color={theme.colors.textSubtle}>{pairSymbol}</Text>
        </div>
      </Flex>
      <Flex style={{ flex: '0 100%', justifyContent: 'center' }}>
        {account?
          <Button fullWidth onClick={handleStakeClick}>Stake</Button>
          :
          <UnlockButton />
        }
      </Flex>
    </>
  )
}

export default Component
