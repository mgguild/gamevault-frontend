import React, { useContext, useState } from 'react'
import { useLocation } from 'react-router-dom'
import BigNumber from 'bignumber.js'
import { useWeb3React } from '@web3-react/core'
import { getImageUrlFromToken } from 'utils/assetFetch'
import { Flex, Link, Text, Heading } from '@metagg/mgg-uikit'
import { ThemeContext } from 'styled-components'
import { useFarms, usePollFarmsData } from 'state/hooks'
import { getAddress } from 'utils/addressHelpers'
import UnlockButton from 'components/UnlockButton'
import RenderSocials from 'components/Launchpad/SocialGroup'
import { getBscScanAddressUrl } from 'utils/bscscan'
import { Card2Container, TokenLogo, Badge, LinearBG, PageContainer } from 'views/Farms/components/FarmCards/styles'
import InputComponent from '../../components/InputComponent'
import { FlexC, StatCard, Stats, TableStyle, ChartStyle } from '../styled'
import { Series } from '../types'
import ApexChart from '../../components/ApexCharts'
import RenderTable from '../Table'

const RenderFarm: React.FC<{ farmID: string; stakingType?: string; tblColumns: any }> = ({
  farmID,
  tblColumns,
  stakingType,
}) => {
  const [dayDuration, setDayDuration] = useState<number>(0)
  const theme = useContext(ThemeContext)
  const { account } = useWeb3React()
  const { pathname } = useLocation()
  const { data: farmsLP, userDataLoaded } = useFarms()
  const isArchived = pathname.includes('archived')
  const currentFarm = farmsLP.filter((farm) => new BigNumber(farm.pid).isEqualTo(new BigNumber(farmID)))[0]
  usePollFarmsData(isArchived)

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
            <Heading style={{ fontSize: '1.875rem' }} color="white">
              {' '}
              LP Farming Stats
            </Heading>
            <Text color="white">Learn About {currentFarm.name} LP staking Farm, and track its results</Text>
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
            justifyContent: 'space-between',
            gap: '0.5rem',
            zIndex: 3,
          }}
        >
          <StatCard>
            <Text color={theme.colors.MGG_accent2}>Total {currentFarm.lpSymbol} Staked</Text>
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
            <Text color={theme.colors.MGG_accent2}>Total {currentFarm.quoteToken.symbol} Rewards Locked</Text>
            <Heading style={{ fontSize: '1.875rem' }}>1.977M</Heading>
            <hr
              style={{
                width: '100%',
                borderTop: `1px solid ${theme.colors.MGG_active}`,
                borderBottom: `1px solid ${theme.colors.MGG_active}`,
              }}
            />
            <Text fontSize="0.8rem" color={theme.colors.textSubtle}>
              26.21 {currentFarm.token.symbol} token per minute
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
            <Text color={theme.colors.MGG_accent2}>Total {currentFarm.quoteToken.symbol} Rewards Unlocked</Text>
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
  const farmAddress = getAddress(currentFarm.token.address)
  return (
    <PageContainer bgColor={currentFarm.UIProps.bgColor} contain={currentFarm.UIProps.contain}>
      <LinearBG style={{ minHeight: '100vh' }}>
        <Flex>
          <>
            <Card2Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Flex style={{ textAlign: 'center', flexFlow: 'column', rowGap: '1rem' }}>
                <Flex style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <TokenLogo size="3rem" src={getImageUrlFromToken(currentFarm.token)} />
                  <Heading color="white" style={{ fontSize: '1.875rem', padding: '0 1rem' }}>
                    {currentFarm.name} Token
                  </Heading>
                </Flex>
                <Text color="white">Hold your {currentFarm.token.symbol} tokens for great benefits</Text>
                <Flex justifyContent='center'>
                  <Text color="white">
                    Token address{' '}
                    <Link
                      style={{ display: 'contents' }}
                      href={getBscScanAddressUrl(getAddress(currentFarm.token.address))}
                    >
                         { `${farmAddress.substring(0, 5)}...${farmAddress.substring(farmAddress.length-5)}`}
                    </Link>
                  </Text>
                </Flex>
                <RenderSocials socials={currentFarm.UIProps.socials} center color="white" size={20} />
              </Flex>
            </Card2Container>
          </>
        </Flex>
        <FlexC>
          <FlexC style={{ backgroundColor: theme.colors.MGG_mainBG, zIndex: 3, }}>
            <Heading style={{ fontSize: '1.875rem' }}>{currentFarm.lpSymbol} Staking Farm</Heading>
            <Text>Deposit your {currentFarm.lpSymbol} Tokens to earn Extra Annual Percentage Rate</Text>
            <Text color={theme.colors.MGG_accent2}>Current APR</Text>
            <Flex
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '1rem',
                backgroundColor: theme.colors.MGG_container,
              }}
            >
              <Heading style={{ fontSize: '1.875rem' }}>150%</Heading>
            </Flex>

            <Flex style={{ width: '100%', flexFlow: 'row wrap', gap: '1rem', justifyContent: 'space-evenly' }}>
              <Stats>
                <div>
                  <Heading size="l">{dayDuration !== 0 ? `${dayDuration} days` : 'Select Days'}</Heading>
                  {dayDuration !== 0 && <Text fontSize="0.8rem">Program duration</Text>}
                </div>
              </Stats>
              <Stats>
                <div>
                  <Heading size="l">June 03, 2022</Heading>
                  <Text fontSize="0.8rem">Last day to earn APR</Text>
                </div>
              </Stats>
              {/* <Stats>
                  <div>
                    <Heading size="l">14 days</Heading>
                    <Text fontSize="0.8rem">Minimum Staking Time</Text>
                  </div>
                </Stats> */}
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
                  <UnlockButton customTitle="Connect Wallet to Stake" />
                </Flex>
              ) : (
                <InputComponent
                  dayDuration={dayDuration}
                  dayFunction={setDayDuration}
                  stakingType="farm"
                  currentFarm={currentFarm}
                  account={account}
                />
              )}
              <Flex style={{ flex: '0 100%' }} />
              <Flex style={{ flex: '0 50%' }}>
                <Text fontSize="0.7rem" color={theme.colors.MGG_accent2}>
                  Add Liquidity to get {currentFarm.lpSymbol} Tokens
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

export default RenderFarm
