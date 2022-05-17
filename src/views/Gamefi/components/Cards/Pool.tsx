import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Link as RLink } from 'react-router-dom'
import BigNumber from 'bignumber.js'
import { Flex, Link, Image, RowType, Toggle } from '@pancakeswap/uikit'
import { Text, Heading } from '@metagg/mgg-uikit'
import { Oval } from 'react-loading-icons'
import styled, { ThemeContext } from 'styled-components'
import tokens from 'config/constants/tokens'
import { Token, PoolCategory } from 'config/constants/types'
import { Pool } from 'state/types'
import UnlockButton from 'components/UnlockButton'
import { useTranslation } from 'contexts/Localization'
import { BIG_ZERO } from 'utils/bigNumber'
import { usePoolPrice } from 'hooks/price'
import { getPoolApr } from 'utils/apr'
import { getBscScanAddressUrl } from 'utils/bscscan'
import { getBalanceNumber, formatNumber } from 'utils/formatBalance'
import { getPoolBlockInfo } from 'views/Pools/helpers'
import { useBlock } from 'state/block/hooks'
import { getBscScanLink } from 'utils'
import { getAddress } from 'utils/addressHelpers'
import { Cards2, Card2Container, TokenLogo, Badge } from './styled'

const getImageUrlFromToken = (token: Token) => {
  const address = getAddress(token.symbol === 'BNB' ? tokens.wbnb.address : token.address)
  return `/images/tokens/${address}.${token.iconExtension ?? 'svg'}`
}

interface PoolCard2Props {
  bgColor?: string
  src?: string
  userDataReady: boolean
  pool: Pool
  removed: boolean
  cakePrice?: BigNumber
  account?: string
  isNew?: boolean
}

const PoolCard2: React.FC<PoolCard2Props> = ({
  bgColor = '#030f62',
  src = './MGG.png',
  userDataReady,
  pool,
  account,
  isNew,
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
  const { stakingPrice, rewardPrice } = usePoolPrice(getAddress(stakingToken.address), getAddress(earningToken.address),)
  const isBnbPool = poolCategory === PoolCategory.BINANCE
  const poolApr = getPoolApr(stakingPrice, rewardPrice, totalStaked, rewardPerBlock) ?? 0
  const apr = poolApr > 0 ? `${poolApr.toFixed(2)} %` : <Oval width="20px" height="20px" />

  return (
    <>
      <Cards2 src={src} bgColor={pool.UIProps.bgColor} className="shodow-pop" style={{ cursor: 'pointer' }}>
        <RLink to={`/gamefi/${`Pools`}/${pool.sousId}`}>
          <Card2Container style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <TokenLogo size="3.5rem" src={getImageUrlFromToken(stakingToken)} />
            <Flex
              style={{
                flexFlow: 'row wrap',
                columnGap: '0.5rem',
                justifyContent: 'end',
              }}
            >
              {isNew && (
                <div>
                  <Badge>
                    <Text color="white">New</Text>
                  </Badge>
                </div>
              )}
              <TokenLogo size="2rem" src={getImageUrlFromToken(earningToken)} />
              <div>
                <Badge type={1}>
                  <Text color="white">Pool Based</Text>
                </Badge>
              </div>
            </Flex>
            <Flex style={{ alignItems: 'end' }}>
              <div>
                <Text color="white">{`${stakingToken.symbol}-${earningToken.symbol} Staking`}</Text>
                <Heading color="white">{pool.name}</Heading>
              </div>
            </Flex>
            <Flex style={{ justifyContent: 'end', alignItems: 'end' }}>
              <div style={{ textAlign: 'end' }}>
                <Text color="white">APR {apr}</Text>
                <Heading color="white">
                  {!isComingSoon && `${formatNumber(blocksRemaining, 0, 0)}`} {isComingSoon && '-'} blocks
                </Heading>
              </div>
            </Flex>
          </Card2Container>
        </RLink>
      </Cards2>
    </>
  )
}

export default PoolCard2
