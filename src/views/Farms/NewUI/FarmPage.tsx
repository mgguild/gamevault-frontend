import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Route, useLocation, useRouteMatch, RouteComponentProps } from 'react-router-dom'
import BigNumber from 'bignumber.js'
import moment from 'moment'
import { useWeb3React } from '@web3-react/core'
import { Grid } from '@mui/material'
import { RefreshCcw } from 'react-feather'
import { Flex, Link, Text, Heading, Button, Input } from '@metagg/mgg-uikit'
import styled, { ThemeContext } from 'styled-components'
import FlexLayout from 'components/layout/Flex'
import Page from 'components/layout/Page'
import useMedia from 'use-media'
import {
  useFarms,
  usePollFarmsData,
  usePriceCakeBusd,
  usePools,
  useFetchPublicPoolsData,
  useCakeVault,
  useFetchCakeVault,
} from 'state/hooks'
import usePersistState from 'hooks/usePersistState'
import { useFarmPrice } from 'hooks/price'
import usePrevious from 'utils/refHelpers'
import { Farm, Pool } from 'state/types'
import { useTranslation } from 'contexts/Localization'
import { getBalanceNumber, getBalanceAmount, toBigNumber } from 'utils/formatBalance'
import { getFarmApr, getFarmV2Apr } from 'utils/apr'
import useTokenBalance from 'hooks/useTokenBalance'
import { orderBy } from 'lodash'
import partition from 'lodash/partition'
import tokens from 'config/constants/tokens'
import { Token } from 'config/constants/types'
import { getAddress } from 'utils/addressHelpers'
import isArchivedPid from 'utils/farmHelpers'
import { latinise } from 'utils/latinise'
import UnlockButton from 'components/UnlockButton'
import PageHeader from 'components/PageHeader'
import SearchInput from 'components/SearchInput'
import Select, { OptionProps } from 'components/Select/Select'
import { ApexOptions } from 'apexcharts'
import ReactApexChart from 'react-apexcharts'
import { useTable } from 'react-table'
import FarmCard, { FarmWithStakedValue } from '../components/FarmCard/FarmCard'
import Table from '../components/FarmTable/FarmTable'
import FarmTabButtons from '../components/FarmTabButtons'
import { RowProps } from '../components/FarmTable/Row'
import { DesktopColumnSchema, ViewMode } from '../components/types'
import { ReactComponent as FarmsDarkLogo } from '../components/assets/farm-dark.svg'
import { ReactComponent as FarmsLightLogo } from '../components/assets/farm-light.svg'
import { getAprData, getCakeVaultEarnings } from '../../Pools/helpers'
import SvgIcon from '../../../components/Launchpad/SvgIcon'
import { getBscScanAddressUrl } from '../../../utils/bscscan'
import { Cards2, Card2Container, TokenLogo, Badge, LinearBG, PageContainer } from '../components/FarmCards/styles'
import { RenderSocials } from '../../../components/Launchpad/Logo'
import InputComponent from './InputComponent'
import {
  FlexC,
  ButtonSM,
  StatCard,
  Stats,
  TableStyle,
  ChartStyle
} from './styled'

BigNumber.config({
  DECIMAL_PLACES: 4,
  FORMAT: {
    decimalSeparator: '.',
    groupSeparator: ',',
    groupSize: 3,
  },
})


type Series = {
  name: string
  data: number[]
}

class ApexChart extends React.Component<{ series: Series[] }, { options: ApexOptions; series: Series[] }> {
  constructor(props) {
    super(props)

    this.state = {
      series: props.series,

      options: {
        chart: {
          id: 'basic-area',
          toolbar: {
            show: true,
            tools: {
              download: false,
              selection: false,
              zoom: true,
              zoomin: true,
              zoomout: true,
              pan: false,
              reset: '<img src="/images/icons/refresh-ccw.svg" />',
            },
          },
        },
        xaxis: {
          categories: ['03/15', '03/16', '03/17', '03/18', '03/19', '03/20', '03/21', '03/22', '03/23'],
        },
        markers: {
          size: 5,
          colors: ['#000524'],
          strokeColors: ['#00BAEC'],
          strokeWidth: 3,
        },
        dataLabels: {
          enabled: false,
        },
        // yaxis:{
        //   labels:{
        //     style:{
        //       colors:[theme.colors.text]
        //     }
        //   }
        // }
      },
    }
  }

  render() {
    const { options, series } = this.state
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <ReactApexChart options={options} series={series} type="area" height={300} width="100%" />
      </div>
    )
  }
}

const options: ApexOptions = {
  chart: {
    id: 'basic-area',
    events: {
      mounted: (chart) => {
        chart.windowResizeHandler()
      },
    },
    height: '100%',
    width: '100%',
  },
  xaxis: {
    categories: [0.001, 0.002, 0.003, 0.004, 0.005, 0.006, 0.007, 0.008, 0.009],
  },
}

const getImageUrlFromToken = (token: Token) => {
  const address = getAddress(token.symbol === 'BNB' ? tokens.wbnb.address : token.address)
  return `/images/tokens/${address}.${token.iconExtension ?? 'svg'}`
}

const RenderTable = ({ columns, data }) => {
  const theme = useContext(ThemeContext)
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data })

  return (
    <table {...getTableProps()}>
      <thead style={{ width: '100%' }}>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()}>
                <Text color={theme.colors.MGG_accent2}>{column.render('Header')}</Text>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => {
                return (
                  <td {...cell.getCellProps()}>
                    <Text>{cell.render('Cell')}</Text>
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

const RenderFarm: React.FC<{ farmID: string; tblColumns: any }> = ({ farmID, tblColumns }) => {
  const [dayDuration, setDayDuration] = useState<string>('')
  const theme = useContext(ThemeContext)
  const { path } = useRouteMatch()
  const { account, chainId } = useWeb3React()
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

  return (
    <PageContainer bgColor={currentFarm.UIProps.bgColor} contain={currentFarm.UIProps.contain}>
      <LinearBG>
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
                <Flex>
                  <Text color="white">
                    Token address{' '}
                    <Link
                      style={{ display: 'contents' }}
                      href={getBscScanAddressUrl(getAddress(currentFarm.token.address))}
                    >
                      {getAddress(currentFarm.token.address)}
                    </Link>
                  </Text>
                </Flex>
                <RenderSocials socials={currentFarm.UIProps.socials} center color="white" size={20} />
              </Flex>
            </Card2Container>
          </>
        </Flex>
        <FlexC>
          <FlexC style={{ backgroundColor: theme.colors.MGG_mainBG, maxWidth: '40rem', zIndex: 3 }}>
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
                  <Heading size="l">{dayDuration !== '' ? `${dayDuration} days` : 'Select Days'}</Heading>
                  {dayDuration !== '' && <Text fontSize="0.8rem">Program duration</Text>}
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
        </FlexC>
      </LinearBG>
    </PageContainer>
  )
}

const RenderPool: React.FC<{ farmID: string; tblColumns: any }> = ({ farmID, tblColumns }) => {
  const [dayDuration, setDayDuration] = useState<string>('')
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

  const overallStaked = new BigNumber(getBalanceNumber(new BigNumber(currentPool.totalStaked), currentPool.stakingToken.decimals)).toFormat()
  // console.log(currentPool)

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

  return (
    <PageContainer bgColor={currentPool.UIProps.bgColor} contain={currentPool.UIProps.contain}>
      <LinearBG>
        <Flex>
          <>
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
          </>
        </Flex>
        <FlexC>
          <FlexC style={{ backgroundColor: theme.colors.MGG_mainBG, maxWidth: '40rem', zIndex: 3 }}>
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
                  <Heading size="l">{dayDuration !== '' ? `${dayDuration} days ` : 'Select days'}</Heading>
                  {dayDuration !== '' && <Text fontSize="0.8rem">Program duration</Text>}
                </div>
              </Stats>
              <Stats>
                <div>
                   <Heading size="l">{dayDuration !== '' ? `${moment().add(toBigNumber(dayDuration), 'days').format('LL')}` : 'Select days'}</Heading>
                  {dayDuration !== '' && <Text fontSize="0.8rem">Last day to earn APR</Text>}
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
                  <UnlockButton customTitle="Connect wallet to Stake" />
                </Flex>
              ) : (
                <InputComponent
                  dayDuration={dayDuration}
                  dayFunction={setDayDuration}
                  stakingType="pool"
                  currentPoolBased={currentPool}
                  account={account}
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
        </FlexC>
      </LinearBG>
    </PageContainer>
  )
}

const FarmPage: React.FC<RouteComponentProps<{ type: string; farmID: string }>> = ({
  match: {
    params: { type, farmID },
  },
}) => {
  const columns = React.useMemo(
    () => [
      {
        Header: 'Deposit/Withdrawals',
        accessor: 'depWith', // accessor is the "key" in the data
      },
      {
        Header: 'Tokens Staked',
        accessor: 'tokensStaked',
      },
      {
        Header: 'Earnings',
        accessor: 'earnings',
      },
      {
        Header: 'Wallet Address',
        accessor: 'txn',
      },
      {
        Header: 'Time',
        accessor: 'time',
      },
    ],
    [],
  )

  return type === 'LP' ? (
    <RenderFarm farmID={farmID} tblColumns={columns} />
  ) : (
    <RenderPool farmID={farmID} tblColumns={columns} />
  )
}

export default FarmPage
