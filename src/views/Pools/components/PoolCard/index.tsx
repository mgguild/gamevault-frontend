import BigNumber from 'bignumber.js'
import React, { useContext, useEffect, useState } from 'react'
import { CardBody, Flex, Text, Link, LinkExternal } from '@sparkpointio/sparkswap-uikit'
import { PoolCategory } from 'config/constants/types'
import { ThemeContext } from 'styled-components'
import UnlockButton from 'components/UnlockButton'
import { useTranslation } from 'contexts/Localization'
import { BIG_ZERO } from 'utils/bigNumber'
import { usePoolPrice } from 'hooks/price'
import { getPoolApr } from 'utils/apr'
import { getBscScanAddressUrl } from 'utils/bscscan'
import { Pool } from 'state/types'
import { getBalanceNumber, formatNumber } from 'utils/formatBalance'
import { getPoolBlockInfo } from 'views/Pools/helpers'
import { useBlock } from 'state/block/hooks'
import { getBscScanLink } from 'utils'
import DetailsSection from 'views/Farms/components/FarmCard/DetailsSection'
import { StyledCard, StyledCardInner } from './StyledCard'
import CardFooter from './CardFooter'
import StyledCardHeader from './StyledCardHeader'
import CardActions from './CardActions'
import { getAddress } from '../../../../utils/addressHelpers'
import ClaimAction from '../ClaimAction'

const PoolCard: React.FC<{ pool: Pool; account: string; userDataReady: boolean }> = ({
  pool,
  account,
  userDataReady,
}) => {
  const {
    sousId,
    stakingToken,
    earningToken,
    isFinished,
    userData,
    startBlock,
    endBlock,
    isComingSoon,
    poolCategory,
    stakingTokenPrice,
  } = pool
  const { t } = useTranslation()
  const stakedBalance = userData?.stakedBalance ? new BigNumber(userData.stakedBalance) : BIG_ZERO
  const accountHasStakedBalance = stakedBalance.gt(0)
  const theme = useContext(ThemeContext)

  const totalStaked = pool.totalStaked
    ? getBalanceNumber(new BigNumber(pool.totalStaked.toString()), stakingToken.decimals)
    : 0

  const rewardPerBlock = pool?.tokenPerBlock
    ? getBalanceNumber(new BigNumber(pool.tokenPerBlock.toString()), earningToken.decimals)
    : 0

  const temp = new BigNumber(pool.tokenPerBlock).times(new BigNumber(userData.stakedBalance).div(pool.totalStaked))
  const rewardRate = pool?.tokenPerBlock ? getBalanceNumber(temp) : 0

  const { currentBlock } = useBlock()
  const stakingAddess = getAddress(pool.contractAddress)
  const { shouldShowBlockCountdown, blocksUntilStart, blocksRemaining, hasPoolStarted, blocksToDisplay } =
    getPoolBlockInfo(pool, currentBlock)
  const stakingTokenBalance = userData?.stakingTokenBalance ? new BigNumber(userData.stakingTokenBalance) : BIG_ZERO
  const { stakingPrice, rewardPrice } = usePoolPrice(getAddress(stakingToken.address), getAddress(earningToken.address))
  const isBnbPool = poolCategory === PoolCategory.BINANCE
  const apr = getPoolApr(stakingPrice, rewardPrice, totalStaked, rewardPerBlock)
  return (
    <StyledCard isFinished={isFinished && sousId !== 0}>
      <StyledCardHeader
        isStaking={accountHasStakedBalance}
        earningToken={earningToken}
        stakingToken={stakingToken}
        isFinished={isFinished && sousId !== 0}
      />
      <Flex style={{ margin: '24px' }} flexDirection="column" justifyContent="space-evenly">
        <Flex>
          <ClaimAction
            stakingTokenBalance={stakingTokenBalance}
            isBnbPool={isBnbPool}
            pool={pool}
            stakingTokenPrice={stakingTokenPrice}
          />
        </Flex>
        <Flex justifyContent="space-between" style={{ textAlign: 'left' }}>
          <Text>Duration</Text>
          <Link external href={getBscScanLink(hasPoolStarted ? endBlock : startBlock, 'countdown')}>
            <Text color="textSubtle">
              {!isComingSoon && `${formatNumber(blocksRemaining, 0, 0)}`} {isComingSoon && '-'} blocks
            </Text>
          </Link>
        </Flex>

        {/* <AprRow pool={pool} stakingTokenPrice={stakingTokenPrice} /> */}
        {/* <Flex justifyContent="space-between" style={{textAlign: 'left'}}>
            <Text>Total Deposit</Text>
            <Text>{!isComingSoon && `${ formatNumber(totalStaked) }`} {isComingSoon && '-'} {stakingToken.symbol}</Text>
          </Flex> */}
        {/* <Flex justifyContent="space-between" style={{textAlign: 'left'}}>
              <Text>Reward per block</Text>
              <Text>{!isComingSoon && rewardPerBlock} {isComingSoon && '-'}</Text>
          </Flex> */}
        <Flex justifyContent="space-between" style={{ textAlign: 'left' }}>
          <Text>{t('Rate')}</Text>
          <Text>
            {!isComingSoon && formatNumber(rewardRate, 2, 10)} {isComingSoon && '-'} {pool.earningToken.symbol}/block
          </Text>
        </Flex>
        <Flex mt="24px" flexDirection="column" marginTop="10px">
          {account ? (
            <CardActions pool={pool} stakedBalance={stakedBalance} />
          ) : (
            <>
              <UnlockButton />
            </>
          )}
        </Flex>
        {/* <Text color="textSubtle" fontSize="14px">{t('This will only work on Binance Smart Chain')}</Text> */}
        {/* <CardFooter pool={pool} account={account} /> */}
        <DetailsSection stakingAddress={getBscScanAddressUrl(stakingAddess)} />
      </Flex>
    </StyledCard>
  )
}

export default PoolCard
