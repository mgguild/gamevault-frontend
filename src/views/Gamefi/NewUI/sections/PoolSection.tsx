import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Route, useLocation, useRouteMatch } from 'react-router-dom'
import BigNumber from 'bignumber.js'
import moment from 'moment'
import { useWeb3React } from '@web3-react/core'
import { getImageUrlFromToken } from 'utils/assetFetch'
import { Flex, Link, Text, Heading } from '@metagg/mgg-uikit'
import styled, { ThemeContext } from 'styled-components'
import { useFetchPublicPoolsData, usePools } from 'state/hooks'
import { getAddress } from 'utils/addressHelpers'
import { getBalanceNumber, getBalanceAmount, toBigNumber } from 'utils/formatBalance'
import UnlockButton from 'components/UnlockButton'
import RenderSocials from 'components/Launchpad/SocialGroup'
import { getBscScanAddressUrl } from 'utils/bscscan'
import {
  Cards2,
  Card2Container,
  TokenLogo,
  Badge,
  LinearBG,
  PageContainer,
} from 'views/Farms/components/FarmCards/styles'
import InputComponent from '../../components/InputComponent'
import { FlexC, StatCard, Stats, TableStyle, ChartStyle } from '../styled'
import { Series } from '../types'
import ApexChart from '../../components/ApexCharts'
import RenderTable from '../Table'
import { NavOption } from '../../../../components/Launchpad/styled'

BigNumber.config({
  DECIMAL_PLACES: 4,
  FORMAT: {
    decimalSeparator: '.',
    groupSeparator: ',',
    groupSize: 3,
  },
})

const RenderPool: React.FC<{ farmID: string; tblColumns: any }> = ({ farmID, tblColumns }) => {
  const [dayDuration, setDayDuration] = useState<number>(0)
  const theme = useContext(ThemeContext)
  const { path } = useRouteMatch()
  const { account, chainId } = useWeb3React()
  const { pathname } = useLocation()
  const { pools: poolsWithoutAutoVault, userDataLoaded } = usePools(account)

  useFetchPublicPoolsData()

  const currentPool = useMemo(() => {
    const getPool = poolsWithoutAutoVault.filter((pool) =>
      new BigNumber(pool.sousId).isEqualTo(new BigNumber(farmID)),
    )[0]

    return getPool
  }, [poolsWithoutAutoVault, farmID])

  // console.log('currentPool: ', currentPool)
  const overallStaked = new BigNumber(
    getBalanceNumber(new BigNumber(currentPool.totalStaked), currentPool.stakingToken.decimals),
  ).toFormat()

  const data = React.useMemo(
    () => [
      {
        depWith: 'Staking',
        tokensStaked: `39.36k`,
        earnings: '',
        txn: '0x70F657164e5b75689b64B7fd1fA275F334f28e18',
        time: '1hr 53m ago',
      },
      {
        depWith: 'Staking',
        tokensStaked: `39.36k`,
        earnings: '',
        txn: '0x70F657164e5b75689b64B7fd1fA275F334f28e18',
        time: '1hr 53m ago',
      },
      {
        depWith: 'Staking',
        tokensStaked: `39.36k`,
        earnings: '',
        txn: '0x70F657164e5b75689b64B7fd1fA275F334f28e18',
        time: '1hr 53m ago',
      },
    ],
    [],
  )

  const series: Series[] = [
    {
      name: 'MGG',
      data: [0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09],
    },
  ]

  const renderStats = () => {
    return (
      <>
        <Flex style={{ margin: '2rem 0', zIndex: 3 }}>
          <div>
            <Heading style={{ fontSize: '1.875rem' }}> Pool Based Farming Stats</Heading>
            <Text>Learn About {currentPool.name} Pool Based Farm, and track its results</Text>
          </div>
        </Flex>

        <Flex
          style={{
            padding: '1rem 2rem',
            width: '100%',
            flexFlow: 'row wrap',
            justifyContent: 'space-between',
            backgroundColor: theme.colors.MGG_mainBG,
            zIndex: 3,
          }}
        >
          <Text>Current Total Value Locked - $100k</Text>
          <Text>All Time High Value Locked - $120k</Text>
          <Text color={theme.colors.MGG_accent2}>Farm Contract Address</Text>
        </Flex>

        <Flex
          style={{
            width: '100%',
            flexFlow: 'row wrap',
            justifyContent: 'space-evenly',
            gap: '0.5rem',
            zIndex: 3,
          }}
        >
          <StatCard>
            <Text color={theme.colors.MGG_accent2}>Total {currentPool.stakingToken.symbol} Staked</Text>
            <Heading style={{ fontSize: '1.875rem' }}>2M</Heading>
            <hr
              style={{
                width: '100%',
                borderTop: `1px solid ${theme.colors.MGG_active}`,
                borderBottom: `1px solid ${theme.colors.MGG_active}`,
              }}
            />
            <Text fontSize="0.8rem" color={theme.colors.textSubtle}>
              123.456789k LP Tokens
            </Text>
          </StatCard>

          <StatCard>
            <Text color={theme.colors.MGG_accent2}>Total {currentPool.earningToken.symbol} Rewards Locked</Text>
            <Heading style={{ fontSize: '1.875rem' }}>1.977M</Heading>
            <hr
              style={{
                width: '100%',
                borderTop: `1px solid ${theme.colors.MGG_active}`,
                borderBottom: `1px solid ${theme.colors.MGG_active}`,
              }}
            />
            <Text fontSize="0.8rem" color={theme.colors.textSubtle}>
              26.21 {currentPool.earningToken.symbol} token per minute
            </Text>
          </StatCard>

          <StatCard>
            <Text color={theme.colors.MGG_accent2}>Farming Program Ends</Text>
            <Heading style={{ fontSize: '1.875rem' }}>100D 23H 22M</Heading>
            <hr
              style={{
                width: '100%',
                borderTop: `1px solid ${theme.colors.MGG_active}`,
                borderBottom: `1px solid ${theme.colors.MGG_active}`,
              }}
            />
            <Text fontSize="0.8rem" color={theme.colors.textSubtle}>
              145402 Minutes Remaining
            </Text>
          </StatCard>

          <StatCard>
            <Text color={theme.colors.MGG_accent2}>Total {currentPool.earningToken.symbol} Rewards Unlocked</Text>
            <Heading style={{ fontSize: '1.875rem' }}>2M</Heading>
            <hr
              style={{
                width: '100%',
                borderTop: `1px solid ${theme.colors.MGG_active}`,
                borderBottom: `1px solid ${theme.colors.MGG_active}`,
              }}
            />
            <Text fontSize="0.8rem" color={theme.colors.textSubtle}>
              0 Rewards Withdrawn
            </Text>
          </StatCard>
        </Flex>

        <ChartStyle>
          <ApexChart series={series} />
        </ChartStyle>

        <TableStyle>
          <RenderTable columns={tblColumns} data={data} />
        </TableStyle>
      </>
    )
  }

  return (
    <PageContainer bgColor={currentPool.UIProps.bgColor} contain={currentPool.UIProps.contain}>
      <LinearBG style={{ minHeight: '100vh' }}>
        <Flex>
          <Card2Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3 }}>
            <Flex style={{ textAlign: 'center', flexFlow: 'column', rowGap: '1rem' }}>
              <Flex style={{ alignItems: 'center', justifyContent: 'center' }}>
                <TokenLogo size="3rem" src={getImageUrlFromToken(currentPool.stakingToken)} />
                <Heading color="white" style={{ fontSize: '1.875rem', padding: '0 1rem' }}>
                  {currentPool.name} Token
                </Heading>
              </Flex>
              <Text color="white">Hold your {currentPool.stakingToken.symbol} tokens for great benefits</Text>
              <Flex>
                <Text color="white">
                  Token address{' '}
                  <Link
                    style={{ display: 'contents' }}
                    href={getBscScanAddressUrl(getAddress(currentPool.stakingToken.address))}
                  >
                    {getAddress(currentPool.stakingToken.address)}
                  </Link>
                </Text>
              </Flex>
              <RenderSocials socials={currentPool.UIProps.socials} center color="white" size={20} />
            </Flex>
          </Card2Container>
        </Flex>
        <FlexC>
          <FlexC
            style={{ backgroundColor: theme.colors.MGG_mainBG, maxWidth: '40rem', height: '31.7216875', zIndex: 3 }}
          >
            <Heading style={{ fontSize: '1.875rem' }}>
              {currentPool.stakingToken.symbol} - {currentPool.earningToken.symbol} Pool Based Farm
            </Heading>
            <Text>Deposit your {currentPool.stakingToken.symbol} Tokens to earn Extra Annual Percentage Rate</Text>
            <Text color={theme.colors.MGG_accent2}>Total MGG staked</Text>
            <Flex
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '1rem',
                backgroundColor: theme.colors.MGG_container,
              }}
            >
              <Heading style={{ fontSize: '1.875rem' }}>{overallStaked}</Heading>
            </Flex>

            <Flex style={{ width: '100%', flexFlow: 'row wrap', gap: '1rem', justifyContent: 'space-evenly' }}>
              <Stats>
                <div>
                  <Heading size="l">{moment(1652762969000).format('LL')}</Heading>
                  <Text fontSize="0.8rem">Program Start</Text>
                </div>
              </Stats>
              <Stats>
                <div>
                  <Heading size="l">30 days</Heading>
                  <Text fontSize="0.8rem">Minimum stake duration</Text>
                </div>
              </Stats>
              <Stats>
                <div>
                  <Heading size="l">{currentPool.fixedAprConfigs.maxFine}%</Heading>
                  <Text fontSize="0.8rem">Early Unstaking Fee</Text>
                </div>
              </Stats>
            </Flex>

            <Text fontSize="0.8rem" color={theme.colors.textSubtle}>
              <em>*Neither stake nor rewards can be withdrawn before minimum staking time</em>
            </Text>
            <Flex
              style={{
                width: '100%',
                flexWrap: 'wrap',
                rowGap: '1rem',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {!account ? (
                <Flex style={{ flex: '0 100%', justifyContent: 'center' }}>
                  <UnlockButton customTitle="Connect wallet to Stake" />
                </Flex>
              ) : (
                <InputComponent
                  dayDuration={dayDuration}
                  dayFunction={setDayDuration}
                  stakingType="pool"
                  currentPoolBased={currentPool}
                  account={account}
                  chainId={chainId}
                />
              )}
              <Flex style={{ flex: '0 100%' }} />
              <Flex style={{ flex: '0 50%' }}>
                <Text fontSize="0.7rem" color={theme.colors.MGG_accent2}>
                  Add Liquidity to get {currentPool.earningToken.symbol} Tokens
                </Text>
              </Flex>
              <Flex style={{ flex: '0 50%', justifyContent: 'end' }}>
                <Text fontSize="0.7rem" color={theme.colors.MGG_accent2}>
                  Pool info on SparkSwap
                </Text>
              </Flex>
            </Flex>
          </FlexC>

          {/* { renderStats() } */}
        </FlexC>
      </LinearBG>
    </PageContainer>
  )
}

export default RenderPool