import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Route, useLocation, useRouteMatch } from 'react-router-dom'
import BigNumber from 'bignumber.js'
import { useWeb3React } from '@web3-react/core'
import { Flex, Image, RowType, Toggle } from '@pancakeswap/uikit'
import { Oval } from 'react-loading-icons'
import { Text } from '@sparkpointio/sparkswap-uikit'
import styled, { ThemeContext } from 'styled-components'
import FlexLayout from 'components/layout/Flex'
import Page from 'components/layout/Page'
import useMedia from 'use-media'
import { SvgIcon } from '@material-ui/core'
import { useFarms, usePollFarmsData, usePriceCakeBusd } from 'state/hooks'
import usePersistState from 'hooks/usePersistState'
import { useFarmPrice } from 'hooks/price'
import usePrevious from 'utils/refHelpers'
import { Farm } from 'state/types'
import { useTranslation } from 'contexts/Localization'
import { getBalanceNumber, getBalanceAmount } from 'utils/formatBalance'
import { getFarmApr, getFarmV2Apr } from 'utils/apr'
import useTokenBalance from 'hooks/useTokenBalance'
import { orderBy } from 'lodash'
import isArchivedPid from 'utils/farmHelpers'
import { latinise } from 'utils/latinise'
import PageHeader from 'components/PageHeader'
import SearchInput from 'components/SearchInput'
import Select, { OptionProps } from 'components/Select/Select'
import { getAddress } from 'utils/addressHelpers'
import FarmCard, { FarmWithStakedValue } from './components/FarmCard/FarmCard'
import Table from './components/FarmTable/FarmTable'
import FarmTabButtons from './components/FarmTabButtons'
import { RowProps } from './components/FarmTable/Row'
import { DesktopColumnSchema, ViewMode } from './components/types'
import { ReactComponent as FarmsDarkLogo } from './components/assets/farm-dark.svg'
import { ReactComponent as FarmsLightLogo } from './components/assets/farm-light.svg'

const ControlContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  position: relative;

  justify-content: space-between;
  flex-direction: column;
  margin-bottom: 32px;

  ${({ theme }) => theme.mediaQueries.sm} {
    flex-direction: row;
    flex-wrap: wrap;
    padding: 16px 32px;
    margin-bottom: 0;
  }
`

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;

  ${Text} {
    margin-left: 8px;
  }
`

const LabelWrapper = styled.div`
  > ${Text} {
    font-size: 12px;
  }
`

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 0px;

  ${({ theme }) => theme.mediaQueries.sm} {
    width: auto;
    padding: 0;
  }
`

const ViewControls = styled.div`
  flex-wrap: wrap;
  justify-content: space-between;
  display: flex;
  align-items: center;
  width: 100%;

  > div {
    padding: 8px 0px;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    justify-content: flex-start;
    width: auto;

    > div {
      padding: 0;
    }
  }
`

const InfoBox = styled(Flex)`
  @media (max-width: 1024px) {
    flex-direction: column;
    & > * {
      margin: 10px 0px;
    }
  }
`
const StyledImage = styled(Image)`
  margin-left: auto;
  margin-right: auto;
  margin-top: 58px;
`
const NUMBER_OF_FARMS_VISIBLE = 12

const Farms: React.FC = () => {
  const { path } = useRouteMatch()
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const { data: farmsLP, userDataLoaded } = useFarms()
  const cakePrice = usePriceCakeBusd()
  const [query, setQuery] = useState('')
  const [viewMode, setViewMode] = usePersistState(ViewMode.CARD, { localStorageKey: 'sparkswap_farm_view' })
  const { account, chainId } = useWeb3React()
  const [sortOption, setSortOption] = useState('earned')
  const theme = useContext(ThemeContext)
  const isArchived = pathname.includes('archived')
  const isInactive = pathname.includes('history')
  const isActive = !isInactive && !isArchived
  const isMobile = useMedia({ maxWidth: 500 })
  usePollFarmsData(isArchived)

  // Users with no wallet connected should see 0 as Earned amount
  // Connected users should see loading indicator until first userData has loaded
  const userDataReady = !account || (!!account && userDataLoaded)

  const [stakedOnly, setStakedOnly] = useState(!isActive)
  useEffect(() => {
    setStakedOnly(!isActive)
  }, [isActive])
  // const activeFarms = farmsLP.filter((farm) => farm.pid !== 0 && !farm.hasEnded && !isArchivedPid(farm.pid))
  // const inactiveFarms = farmsLP.filter((farm) => farm.pid !== 0 && farm.hasEnded && !isArchivedPid(farm.pid))
  // const archivedFarms = farmsLP.filter((farm) => isArchivedPid(farm.pid))
  const activeFarms = farmsLP.filter((farm) => farm.pid !== 0 && !farm.hasEnded && !isArchivedPid(farm.pid))
  const inactiveFarms = farmsLP.filter((farm) => farm.pid !== 0 && farm.hasEnded && !isArchivedPid(farm.pid))
  const archivedFarms = farmsLP.filter((farm) => isArchivedPid(farm.pid))

  const stakedOnlyFarms = activeFarms.filter(
    (farm) => farm.userData && new BigNumber(farm.userData.stakedBalance).isGreaterThan(0),
  )

  const stakedInactiveFarms = inactiveFarms.filter(
    (farm) => farm.userData && new BigNumber(farm.userData.stakedBalance).isGreaterThan(0),
  )

  const stakedArchivedFarms = archivedFarms.filter(
    (farm) => farm.userData && new BigNumber(farm.userData.stakedBalance).isGreaterThan(0),
  )

  const farmsList = useCallback(
    (farmsToDisplay: Farm[]): FarmWithStakedValue[] => {
      let farmsToDisplayWithAPR: FarmWithStakedValue[] = farmsToDisplay.map((farm) => {
        if (!farm.lpTotalInQuoteToken || !farm.quoteToken.busdPrice) {
          return farm
        }
        const totalLiquidity = new BigNumber(farm.lpTotalInQuoteToken).times(farm.quoteToken.busdPrice)
        const apr = isActive ? getFarmApr(new BigNumber(farm.poolWeight), cakePrice, totalLiquidity) : 0

        return { ...farm, apr, liquidity: totalLiquidity }
      })

      if (query) {
        const lowercaseQuery = latinise(query.toLowerCase())
        farmsToDisplayWithAPR = farmsToDisplayWithAPR.filter((farm: FarmWithStakedValue) => {
          return (
            latinise(farm.lpSymbol.toLowerCase()).includes(lowercaseQuery) ||
            latinise(farm.quoteToken.symbol.toLowerCase()).includes(lowercaseQuery)
          )
        })
      }
      return farmsToDisplayWithAPR
    },
    [cakePrice, query, isActive],
  )

  const handleChangeQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
  }

  const loadMoreRef = useRef<HTMLDivElement>(null)

  const [numberOfFarmsVisible, setNumberOfFarmsVisible] = useState(NUMBER_OF_FARMS_VISIBLE)
  const [observerIsSet, setObserverIsSet] = useState(false)
  const farmsStakedMemoized = useMemo(() => {
    let farmsStaked = []

    const sortFarms = (farms: FarmWithStakedValue[]): FarmWithStakedValue[] => {
      switch (sortOption) {
        // case 'promoted':
        //   return orderBy(
        //     farms,
        //     (farm: FarmWithStakedValue) => (farm.isPromoted ?? 0),
        //     'desc',
        //   )
        case 'apr':
          return orderBy(farms, (farm: FarmWithStakedValue) => farm.apr, 'desc')
        case 'duration':
          return orderBy(
            farms,
            (farm: FarmWithStakedValue) => (farm.remainingDays ? Number(farm.remainingDays) : 0),
            'desc',
          )
        case 'multiplier':
          return orderBy(
            farms,
            (farm: FarmWithStakedValue) => (farm.multiplier ? Number(farm.multiplier.slice(0, -1)) : 0),
            'desc',
          )
        case 'earned':
          return orderBy(
            farms,
            (farm: FarmWithStakedValue) => (farm.userData ? Number(farm.userData.earnings) : 0),
            'desc',
          )
        case 'liquidity':
          return orderBy(farms, (farm: FarmWithStakedValue) => Number(farm.liquidity), 'desc')
        default:
          return farms
      }
    }

    if (isActive) {
      farmsStaked = stakedOnly ? farmsList(stakedOnlyFarms) : farmsList(activeFarms)
    }
    if (isInactive) {
      farmsStaked = stakedOnly ? farmsList(stakedInactiveFarms) : farmsList(inactiveFarms)
    }
    if (isArchived) {
      farmsStaked = stakedOnly ? farmsList(stakedArchivedFarms) : farmsList(archivedFarms)
    }

    return sortFarms(farmsStaked).slice(0, numberOfFarmsVisible)
  }, [
    sortOption,
    activeFarms,
    farmsList,
    inactiveFarms,
    archivedFarms,
    isActive,
    isInactive,
    isArchived,
    stakedArchivedFarms,
    stakedInactiveFarms,
    stakedOnly,
    stakedOnlyFarms,
    numberOfFarmsVisible,
  ])

  const [activeTab, setActiveTab] = useState(0)
  const handleItemClick = (index: number) => setActiveTab(index)
  const tabs = [t('Total'), 'Storm', 'Flippers', 'Cakers']

  useEffect(() => {
    const showMoreFarms = (entries) => {
      const [entry] = entries
      if (entry.isIntersecting) {
        setNumberOfFarmsVisible((farmsCurrentlyVisible) => farmsCurrentlyVisible + NUMBER_OF_FARMS_VISIBLE)
      }
    }
    // Uncomment this if !comingsoon
    if (!observerIsSet) {
      const loadMoreObserver = new IntersectionObserver(showMoreFarms, {
        rootMargin: '0px',
        threshold: 1,
      })
      loadMoreObserver.observe(loadMoreRef.current)
      setObserverIsSet(true)
    }
  }, [farmsStakedMemoized, observerIsSet])

  const rowData = farmsStakedMemoized.map((farm) => {
    const { token, quoteToken } = farm
    const tokenAddress = token.address
    const quoteTokenAddress = quoteToken.address
    const lpLabel = farm.lpSymbol && farm.lpSymbol.split(' ')[0].toUpperCase().replace('PANCAKE', '')

    const row: RowProps = {
      apr: {
        value: farm.apr && farm.apr.toLocaleString('en-US', { maximumFractionDigits: 2 }),
        multiplier: farm.multiplier,
        lpLabel,
        tokenAddress,
        quoteTokenAddress,
        cakePrice,
        originalValue: farm.apr,
      },
      farm: {
        label: lpLabel,
        pid: farm.pid,
        token: farm.token,
        quoteToken: farm.quoteToken,
      },
      earned: {
        earnings: getBalanceNumber(new BigNumber(farm.userData.earnings)),
        pid: farm.pid,
      },
      liquidity: {
        liquidity: farm.liquidity,
      },
      multiplier: {
        multiplier: farm.multiplier,
      },
      details: farm,
    }

    return row
  })

  const renderContent = (): JSX.Element => {
    if (viewMode === ViewMode.TABLE && rowData.length) {
      const columnSchema = DesktopColumnSchema

      const columns = columnSchema.map((column) => ({
        id: column.id,
        name: column.name,
        label: column.label,
        sort: (a: RowType<RowProps>, b: RowType<RowProps>) => {
          switch (column.name) {
            case 'farm':
              return b.id - a.id
            case 'apr':
              if (a.original.apr.value && b.original.apr.value) {
                return Number(a.original.apr.value) - Number(b.original.apr.value)
              }

              return 0
            case 'earned':
              return a.original.earned.earnings - b.original.earned.earnings
            default:
              return 1
          }
        },
        sortable: column.sortable,
      }))

      return <Table data={rowData} columns={columns} userDataReady={userDataReady} />
    }

    return (
      <div style={{ marginTop: '25x', paddingTop: '25px' }}>
        <FlexLayout>
          <Route exact path={`${path}`}>
            {farmsStakedMemoized.map((farm) => (
              <FarmCard
                userDataReady={userDataReady}
                key={farm.pid}
                farm={farm}
                cakePrice={cakePrice}
                account={account}
                removed={false}
              />
            ))}
          </Route>
          <Route exact path={`${path}/history`}>
            {farmsStakedMemoized.map((farm) => (
              <FarmCard
                userDataReady={userDataReady}
                key={farm.pid}
                farm={farm}
                cakePrice={cakePrice}
                account={account}
                removed
              />
            ))}
          </Route>
          <Route exact path={`${path}/archived`}>
            {farmsStakedMemoized.map((farm) => (
              <FarmCard
                userDataReady={userDataReady}
                key={farm.pid}
                farm={farm}
                cakePrice={cakePrice}
                account={account}
                removed
              />
            ))}
          </Route>
          {/* {farmsList(activeFarms).map((farm) => ( */}
          {/*  <FarmCard userDataReady={userDataReady} key={farm.pid} farm={farm} cakePrice={cakePrice} account={account} removed={false} /> */}
          {/* ))} */}
        </FlexLayout>
      </div>
    )
  }

  const handleSortOptionChange = (option: OptionProps): void => {
    setSortOption(option.value)
  }

  const renderInactiveContent = (): JSX.Element => {
    return (
      <div>
        <div style={{ margin: '20px' }}>
          <Text fontSize="24px" bold>
            {' '}
            Inactive Liquidity Pools{' '}
          </Text>
        </div>

        <FlexLayout>
          {farmsList(inactiveFarms).map((farm) => (
            <FarmCard
              userDataReady={userDataReady}
              key={farm.pid}
              farm={farm}
              cakePrice={cakePrice}
              account={account}
              removed
            />
          ))}
        </FlexLayout>
      </div>
    )
  }

  const [isFetchData, setFetchData] = useState<boolean | null>(true)
  const mggFarm = farmsStakedMemoized.filter((farm) => farm.isMain)[0]

  // const token1Balance = useTokenBalance(mggFarm.token.address[chainId], mggFarm.lpAddresses[chainId])
  // const token2Balance = useTokenBalance(mggFarm.pairToken.address[chainId], mggFarm.lpAddresses[chainId])
  const lpTotalSupply = getBalanceNumber(new BigNumber(mggFarm.totalDeposits ?? 0))
  const { LPPrice, rewardPrice } = useFarmPrice(
    Number(lpTotalSupply),
    getAddress(mggFarm.token.address),
    getAddress(mggFarm.pairToken.address),
    getAddress(mggFarm.quoteToken.address),
    getAddress(mggFarm.lpAddresses),
    isFetchData,
  )
  const prevLPPrice = usePrevious(LPPrice)
  const prevRewardPrice = usePrevious(rewardPrice)
  useEffect(() => {
    if (LPPrice > 0 || rewardPrice > 0) {
      setFetchData(false)
    }
    setTimeout(() => {
      setFetchData(true)
      if (LPPrice !== prevLPPrice || rewardPrice !== prevRewardPrice) {
        setFetchData(true)
      } else {
        setFetchData(false)
      }
    }, 60000)
    if (prevLPPrice === LPPrice || prevRewardPrice === rewardPrice) {
      setFetchData(false)
    }
  }, [LPPrice, rewardPrice, setFetchData, prevLPPrice, prevRewardPrice])
  useEffect(() => {
    return setFetchData(null)
  }, [])
  const farmV2Apr = useMemo(
    () => getFarmV2Apr(LPPrice, rewardPrice, Number(mggFarm.totalDeposits), Number(mggFarm.rewardRate)),
    [LPPrice, rewardPrice, mggFarm.totalDeposits, mggFarm.rewardRate],
  )

  const apr = farmV2Apr > 0 ? `${farmV2Apr.toFixed(2)} %` : <Oval width="20px" height="20px" />
  const totalStaked =
    getBalanceNumber(new BigNumber(mggFarm.totalDeposits)) > 0 ? (
      `${getBalanceAmount(new BigNumber(mggFarm.totalDeposits)).toFormat(4)} ${mggFarm.lpSymbol}`
    ) : (
      <Oval width="20px" height="20px" />
    )
  const tvr = useMemo(
    () => getBalanceAmount(new BigNumber(mggFarm.lpTotalSupply)).times(LPPrice).toFixed(4),
    [mggFarm.lpTotalSupply, LPPrice],
  )

  return (
    <>
      <PageHeader>
        <Flex
          alignItems="center"
          justifyContent="space-around"
          flexDirection={['column', null, 'row']}
          style={isMobile ? { flexDirection: 'column-reverse' } : { minHeight: '20vh', marginLeft: '-16px' }}
          padding="24px"
        >
          <Flex flexDirection="column" flex="2">
            <Flex
              justifyContent="space-around"
              flexDirection="column"
              padding="25px 25px 25px 0px"
              mr={['8px', 0]}
              style={{ borderBottom: `1px solid ${theme.colors.MGG_active}` }}
            >
              <Text color={theme.colors.primary} fontSize="60px" bold>
                Liquidity Staking
              </Text>
              <Text color="text" bold style={isMobile ? { fontSize: '17px' } : { fontSize: '27px' }}>
                Earn MGG with your LP tokens!
              </Text>
            </Flex>
            <InfoBox style={{ width: '100%' }} margin="20px 0px 0px 0px" justifyContent="space-between">
              <Flex flexDirection="column">
                <Text fontSize="17px" bold color={theme.colors.MGG_accent2}>
                  Total Tokens Staked
                </Text>
                <Text fontSize="20px"> {totalStaked}</Text>
              </Flex>
              <Flex flexDirection="column">
                <Text fontSize="17px" bold color={theme.colors.MGG_accent2}>
                  Total Value Locked
                </Text>
                <Text fontSize="20px">
                  {Number(tvr) > 0 && Number(tvr) !== Infinity ? `${tvr} USD` : <Oval width="20px" height="20px" />}
                </Text>
              </Flex>
              <Flex flexDirection="column">
                <Text fontSize="17px" bold color={theme.colors.MGG_accent2}>
                  APR
                </Text>
                <Text fontSize="20px">{apr}</Text>
              </Flex>
            </InfoBox>
          </Flex>
          {/* <Flex style={isMobile ? {
            fontSize: '150px',
            margin: 'auto',
            marginTop: '20px',
            marginBottom: '20px',
          } : { fontSize: '240px', marginRight: '-118px' }}>
            <SvgIcon component={theme.isDark ? FarmsDarkLogo : FarmsLightLogo} viewBox='0  0 384 512'
                     style={isMobile ? { width: '200px' } : { width: '500px' }} fontSize='inherit' />
          </Flex> */}
        </Flex>
      </PageHeader>
      <Page>
        {/* <ControlContainer>
          <ViewControls>
            <ToggleView viewMode={viewMode} onToggle={(mode: ViewMode) => setViewMode(mode)} />
            <ToggleWrapper>
              <Toggle checked={stakedOnly} onChange={() => setStakedOnly(!stakedOnly)} scale='sm' />
              <Text> {t('Staked only')}</Text>
            </ToggleWrapper>
            <FarmTabButtons hasStakeInFinishedFarms={stakedInactiveFarms.length > 0} />
          </ViewControls>
          {/* <FilterContainer>
            <LabelWrapper>
              <Text textTransform='uppercase'>{t('Sort by')}</Text>
              <Select
                options={[
                  // {
                  //   label: t('Hot'),
                  //   value: 'hot',
                  // },
                  // {
                  //   label: t('APR'),
                  //   value: 'apr',
                  // },
                  // {
                  //   label: t('Multiplier'),
                  //   value: 'multiplier',
                  // },
                  // {
                  //   label: t('Promoted'),
                  //   value: 'promoted',
                  // },
                  {
                    label: t('Earned'),
                    value: 'earned',
                  },
                  {
                    label: t('Duration'),
                    value: 'duration',
                  },
                  {
                    label: t('Liquidity'),
                    value: 'liquidity',
                  },
                ]}
                onChange={handleSortOptionChange}
              />
            </LabelWrapper>
            <LabelWrapper style={{ marginLeft: 16 }}>
              <Text textTransform='uppercase'>{t('Search')}</Text>
              <SearchInput onChange={handleChangeQuery} placeholder='Search Farms' />
            </LabelWrapper>
          </FilterContainer>
        </ControlContainer> */}

        {renderContent()}
        <div ref={loadMoreRef} />
      </Page>
    </>
  )
}

export default Farms
