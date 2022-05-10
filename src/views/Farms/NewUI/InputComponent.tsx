import React, { Dispatch, SetStateAction, useState, useContext, useMemo, useCallback } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { Grid } from '@mui/material'
import { Flex, Text, Button, Input } from '@metagg/mgg-uikit'
import { FarmWithStakedValue } from 'views/Gamefi/components/config'
import BigNumber from 'bignumber.js'
import { getBalanceNumber, toBigNumber } from 'utils/formatBalance'
import { Pool } from 'state/types'
import { EPOCH_PER_YEAR, EPOCH_PER_DAY } from 'config'

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
  currentFarm?: FarmWithStakedValue
  stakingType: string
  currentPoolBased?: Pool
}

const intoDays = (seconds: string) => {
  return new BigNumber(seconds).div(new BigNumber(EPOCH_PER_DAY)).toJSON()
}

const Component: React.FC<ComponentProps> = ({
  dayDuration,
  dayFunction,
  currentFarm,
  currentPoolBased,
  stakingType,
}) => {
  const theme = useContext(ThemeContext)
  const pairSymbol = stakingType === 'farm' ? currentFarm.lpSymbol : currentPoolBased.stakingToken.symbol

  const currentStake = stakingType === 'farm' ? currentFarm : currentPoolBased
  const userTotalStaked = currentStake.userData ? new BigNumber(getBalanceNumber(new BigNumber(currentStake.userData.stakedBalance), currentStake.stakingToken.decimals)) : new BigNumber(0)
  const userStakingBal = currentStake.userData ? new BigNumber(getBalanceNumber(new BigNumber(currentStake.userData.stakingTokenBalance), currentStake.stakingToken.decimals)) : new BigNumber(0)
  const [tierId, setTierId] = useState(null)

  const [toStakeTkn, setTknStake] = useState('')
  const [percentage, setPercentage] = useState('0.0')
  const [estimatedProfit, setEstimatedProfit] = useState('-')

  const tiersDuration = useMemo(() => Object.keys(currentStake.stakeTiers).map((tier) => {
    return intoDays(currentStake.stakeTiers[tier].duration)
  }), [currentStake])

  const APYs = useMemo(() => Object.keys(currentStake.stakeTiers).map((tier) => {
    return getBalanceNumber(new BigNumber(currentStake.stakeTiers[tier].apyPerSec).times(new BigNumber(EPOCH_PER_YEAR)), currentStake.stakingToken.decimals).toFixed(0)
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
    setTierId(index)
    setPercentage(new BigNumber(APYs[index]).div(new BigNumber(100)).toString())
  },
  [ // dependencies
    dayFunction,
    tiersDuration,
    setPercentage,
    setTierId,
    APYs
  ])


  return (
    <>
      <Flex justifyContent="center" style={{ width: '100%' }}>
        <Grid container spacing={{ xs: 2, md: 1 }} justifyContent="center">
          {[0, 1, 2, 3].map((index) => (
            <>
              <Grid item xs={12} sm={3} md={3}>
                <ButtonSM fullWidth onClick={() => handleTierChange(index)}>
                  {`${tiersDuration[index]} Days`}
                </ButtonSM>
              </Grid>
            </>
          ))}
        </Grid>
      </Flex>
      <StyledDetails>
        <Flex>
          <Text>APY</Text>
          <Text>{tierId !== null ? `${APYs[tierId]}%` : <i>select duration</i>}</Text>
        </Flex>
        <Flex>
          <Text>Max fine</Text>
          <Text>10%</Text>
        </Flex>
        { toStakeTkn &&
          <Flex>
            <Text>To Stake</Text>
            <Text>{new BigNumber(toStakeTkn).toFormat()} {pairSymbol}</Text>
          </Flex>
        }
        <Flex>
          <Text>Max profit (estimated)</Text>
          <Text>{ tierId !== null ?
            `≈ ${new BigNumber(estimatedProfit).toFormat()} ${pairSymbol}`
            :
            <i>select duration</i> }
          </Text>
        </Flex>

        <hr style={{ width: '100%' }} />
        <Flex>
          <Text>You staked</Text>
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
          value={toStakeTkn}
          onChange={handleChange}
          style={{ padding: '1.5rem' }}
          placeholder="0" type="number"
        />
        <div style={{ position: 'absolute', top: '0.7rem', right: '1.5rem' }}>
          <Text color={theme.colors.textSubtle}>{pairSymbol}</Text>
        </div>
      </Flex>
      <Flex style={{ flex: '0 100%', justifyContent: 'center' }}>
        <Button fullWidth>Stake</Button>
      </Flex>
    </>
  )
}

export default Component
