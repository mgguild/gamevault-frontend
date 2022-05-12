import React, { useEffect, useState, useRef, useMemo } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { Slider, BalanceInput, AutoRenewIcon, Link } from '@pancakeswap/uikit'
import { Modal, Text, Flex, Heading, Image, Button } from '@metagg/mgg-uikit'
import { useTranslation } from 'contexts/Localization'
import { BASE_EXCHANGE_URL } from 'config'
import { useSousStake } from 'hooks/useStake'
import { useSousUnstake } from 'hooks/useUnstake'
import useTheme from 'hooks/useTheme'
import useToast from 'hooks/useToast'
import BigNumber from 'bignumber.js'
import { useSousApprove, useSousApproveWithAmount } from 'hooks/useApprove'
import { useTokenAllowance } from 'hooks/useTokenBalance'
import { useERC20 } from 'hooks/useContract'
import { getFullDisplayBalance, formatNumber, getDecimalAmount, getBalanceNumber } from 'utils/formatBalance'
import { BIG_ZERO } from 'utils/bigNumber'
import ModalInput from 'components/ModalInput'
import { getAddress } from 'utils/addressHelpers'
import { FarmWithStakedValue } from 'views/Gamefi/components/config'
import { Pool } from 'state/types'


interface StakeModalProps {
  stakingType: string
  currentStake: Pool | FarmWithStakedValue
  pairSymbol: string
  duration: string
  APY: string
  maxFine: string
  stakeAmount: string
  estimatedProfit: string
  userTotalStaked: BigNumber
  userStakingBal: BigNumber
  userAllowance: BigNumber
  onSelectMax?: () => void
  onDismiss?: () => void
}

const StyledDetails = styled(Flex)`
  width: 100%;
  flex-direction: column;
  margin: 0 0 1rem 0;
  & > * {
    justify-content: space-between;
    flex: 1;
    & :first-child {
      color: ${({ theme }) => theme.colors.textSubtle};
    }
  }
`
const HrBroken = styled.hr`
  width: 100%;
  border-top: 3px dashed ${({ theme }) => theme.colors.textSubtle};
  border-bottom: none;
`
const ModalBody = styled.div`
  width: 450px;
  margin-top: -20px;
  padding: 20px;
`


const StakeModal: React.FC<StakeModalProps> = (({
  stakingType,
  currentStake,
  pairSymbol,
  duration,
  APY,
  maxFine,
  stakeAmount,
  estimatedProfit,
  userTotalStaked,
  userStakingBal,
  userAllowance,
  onDismiss,
}) => {
  const { toastSuccess, toastError, toastWarning } = useToast()
  // const { onStake } = useSousStake(sousId, isBnbPool)

  const balDifference = userStakingBal.minus(new BigNumber(stakeAmount))
  const estimatedFee = new BigNumber(stakeAmount).multipliedBy(
    new BigNumber(maxFine).div(new BigNumber(100))
  )

  const stakingTokenContract = useERC20(currentStake.stakingToken.address ? getAddress(currentStake.stakingToken.address) : '')
  const [pendingTx, setPendingTx] = useState(false)

  const { handleApprove, requestedApproval } = useSousApproveWithAmount(
    stakingTokenContract,
    currentStake.sousId,
    currentStake.earningToken.symbol,
    getDecimalAmount(new BigNumber(stakeAmount), currentStake.stakingToken.decimals),
  )
  console.log(userAllowance)
  console.log('userAllowance.gt: ', userAllowance.gt(0))
  console.log('userAllowance.lte: ', new BigNumber(stakeAmount).lte(userAllowance))
  const isApproved = useMemo(() => {
    console.log('requestedApproval: ', requestedApproval)
    const a = userAllowance.gt(0)
    const b = userAllowance.lte(new BigNumber(stakeAmount))
    console.log('a: ', a)
    console.log('userAllowance: ', userAllowance.toNumber())
    console.log('b: ', b, 'stakeAmount: ', stakeAmount, !userAllowance.lt(new BigNumber(stakeAmount)))
    console.log('COMPUTEEEEE: ', (a && b))
    if (userAllowance.gt(0) && !userAllowance.lt(new BigNumber(stakeAmount))) {
      return true
    }
    return false
  }, [
    requestedApproval,
    userAllowance,
    stakeAmount
  ])
  console.log('isApproved: ', isApproved)

  return (
    <>
      <Modal title='' onDismiss={onDismiss}>
        <Flex justifyContent="center">
          <Heading size='lg' mt="-48px" style={{ textAlign: 'center' }}>Staking Summary</Heading>
        </Flex>
        <ModalBody>
          <StyledDetails>
            <Flex>
              <Text>Duration</Text>
              <Text>{ duration } days</Text>
            </Flex>
            <Flex>
              <Text>APY</Text>
              <Text>{ APY }%</Text>
            </Flex>
            <Flex>
              <Text>Max profit (estimated)</Text>
              <Text>≈ { new BigNumber(estimatedProfit).toFormat() } { pairSymbol }</Text>
            </Flex>
            <br />
            <HrBroken />
            <br />
            <Flex>
              <Text>Your Balance</Text>
              <Text>{ userStakingBal.toFormat() } { pairSymbol }</Text>
            </Flex>
            <Flex>
              <Text>To Stake</Text>
              <Text>-{ new BigNumber(stakeAmount).toFormat() } { pairSymbol }</Text>
            </Flex>
            <hr style={{ width: '100%' }} />
            <Flex>
              <Text>New Balance</Text>
              <Text>{ balDifference.toFormat() } { pairSymbol }</Text>
            </Flex>
            <br />
            <br />
            <Flex>
              <Text>Max Early Unstaking Fee</Text>
              <Text>{ maxFine }%</Text>
            </Flex>

            <Flex>
              <Text>Unstaking Fee (estimated)</Text>
              <Text>≈{ estimatedFee.toFormat() } { pairSymbol }</Text>
            </Flex>

          </StyledDetails>
          {isApproved ?
            <Button fullWidth>Confirm</Button>
            :
            <Button
              fullWidth
              isLoading={pendingTx}
              endIcon={pendingTx ? <AutoRenewIcon spin color="currentColor" /> : null}
              onClick={handleApprove}
            >Approve</Button>
          }
        </ModalBody>
      </Modal>
    </>
  )
})

export default StakeModal