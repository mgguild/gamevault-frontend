import React, { useEffect, useMemo, useRef, useState, useContext } from 'react'
import { useLocation, Route, useRouteMatch } from 'react-router-dom'
import styled, { ThemeContext } from 'styled-components'
import BigNumber from 'bignumber.js'
import { useWeb3React } from '@web3-react/core'
import { Heading, Flex, Image } from '@pancakeswap/uikit'
import { Text } from '@sparkpointio/sparkswap-uikit'
import orderBy from 'lodash/orderBy'
import partition from 'lodash/partition'
import { SvgIcon } from '@material-ui/core'
import { useTranslation } from 'contexts/Localization'
import usePersistState from 'hooks/usePersistState'
import { usePoolPrice } from 'hooks/price'
import { usePools, useFetchCakeVault, useFetchPublicPoolsData, usePollFarmsData, useCakeVault } from 'state/hooks'
import { latinise } from 'utils/latinise'
import { getPoolApr } from 'utils/apr'
import { getBalanceAmount, getBalanceNumber } from 'utils/formatBalance'
import FlexLayout from 'components/layout/Flex'
import Page from 'components/layout/Page'
import PageHeader from 'components/PageHeader'
import { StyledHr } from 'views/Farms/components/Divider'
import SearchInput from 'components/SearchInput'
import Select, { OptionProps } from 'components/Select/Select'
import { Pool } from 'state/types'
import useMedia from 'use-media'
import PoolCard from './components/PoolCard'
import CakeVaultCard from './components/CakeVaultCard'
import PoolTabButtons from './components/PoolTabButtons'
import BountyCard from './components/BountyCard'
import HelpButton from './components/HelpButton'
import PoolsTable from './components/PoolsTable/PoolsTable'
import { ViewMode } from './components/ToggleView/ToggleView'
import { getAprData, getCakeVaultEarnings } from './helpers'
import { ReactComponent as FarmsDarkLogo } from './components/assets/farm-dark.svg'
import { ReactComponent as FarmsLightLogo } from './components/assets/farm-light.svg'


const CardLayout = styled(FlexLayout)`
  justify-content: center;
  margin: 25px 0px;
`

const PoolControls = styled(Flex)`
  flex-direction: column;
  margin-bottom: 24px;
  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: row;
  }
`

const SearchSortContainer = styled(Flex)`
  gap: 10px;
  justify-content: space-between;
`

const ControlStretch = styled(Flex)`
  > div {
    flex: 1;
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

const NUMBER_OF_POOLS_VISIBLE = 12

const Pools: React.FC = () => {
  const theme = useContext(ThemeContext)
  const location = useLocation()
  const { t } = useTranslation()
  const { account } = useWeb3React()
  const { pools: poolsWithoutAutoVault, userDataLoaded } = usePools(account)
  const [stakedOnly, setStakedOnly] = usePersistState(false, { localStorageKey: 'pancake_pool_staked' })
  const [numberOfPoolsVisible, setNumberOfPoolsVisible] = useState(NUMBER_OF_POOLS_VISIBLE)
  const [observerIsSet, setObserverIsSet] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const [viewMode, setViewMode] = usePersistState(ViewMode.TABLE, { localStorageKey: 'pancake_farm_view' })
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState('hot')
  const isMobile = useMedia({ maxWidth: 500 })
  const {
    userData: { cakeAtLastUserAction, userShares },
    fees: { performanceFee },
    pricePerFullShare,
    totalCakeInVault,
  } = useCakeVault()
  const accountHasVaultShares = userShares && userShares.gt(0)
  const performanceFeeAsDecimal = performanceFee && performanceFee / 100

  const pools = useMemo(() => {
    const cakePool = poolsWithoutAutoVault.map((pool) => pool.sousId === 0)
    const cakeAutoVault = { ...cakePool, isAutoVault: true }

    return [...poolsWithoutAutoVault]
  }, [poolsWithoutAutoVault])

  // TODO aren't arrays in dep array checked just by reference, i.e. it will rerender every time reference changes?
  const [openPools, finishedPools] = useMemo(() => partition(pools, (pool) => pool.sousId === 9), [pools])
  const [upcomingPools, notUpcomingPools] = useMemo(() => partition(pools, (pool) => pool.isComingSoon), [pools])
  const stakedOnlyFinishedPools = useMemo(
    () =>
      finishedPools.filter((pool) => {
        if (pool.isAutoVault) {
          return accountHasVaultShares
        }
        return pool.userData && new BigNumber(pool.userData.stakedBalance).isGreaterThan(0)
      }),
    [finishedPools, accountHasVaultShares],
  )
  const stakedOnlyOpenPools = useMemo(
    () =>
      openPools.filter((pool) => {
        if (pool.isAutoVault) {
          return accountHasVaultShares
        }
        return pool.userData && new BigNumber(pool.userData.stakedBalance).isGreaterThan(0)
      }),
    [openPools, accountHasVaultShares],
  )
  const hasStakeInFinishedPools = stakedOnlyFinishedPools.length > 0

  usePollFarmsData()
  useFetchCakeVault()
  useFetchPublicPoolsData()

  useEffect(() => {
    const showMorePools = (entries) => {
      const [entry] = entries
      if (entry.isIntersecting) {
        setNumberOfPoolsVisible((poolsCurrentlyVisible) => poolsCurrentlyVisible + NUMBER_OF_POOLS_VISIBLE)
      }
    }

    if (!observerIsSet) {
      const loadMoreObserver = new IntersectionObserver(showMorePools, {
        rootMargin: '0px',
        threshold: 1,
      })
      loadMoreObserver.observe(loadMoreRef.current)
      setObserverIsSet(true)
    }
  }, [observerIsSet])

  const showFinishedPools = location.pathname.includes('history')
  const showUpcomingPools = location.pathname.includes('upcoming')

  const handleChangeSearchQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const handleSortOptionChange = (option: OptionProps): void => {
    setSortOption(option.value)
  }

  const sortPools = (poolsToSort: Pool[]) => {
    switch (sortOption) {
      case 'apr':
        // Ternary is needed to prevent pools without APR (like MIX) getting top spot
        return orderBy(
          poolsToSort,
          (pool: Pool) => (pool.apr ? getAprData(pool, performanceFeeAsDecimal).apr : 0),
          'desc',
        )
      case 'earned':
        return orderBy(
          poolsToSort,
          (pool: Pool) => {
            if (!pool.userData || !pool.earningTokenPrice) {
              return 0
            }
            return pool.isAutoVault
              ? getCakeVaultEarnings(
                  account,
                  cakeAtLastUserAction,
                  userShares,
                  pricePerFullShare,
                  pool.earningTokenPrice,
                ).autoUsdToDisplay
              : pool.userData.pendingReward.times(pool.earningTokenPrice).toNumber()
          },
          'desc',
        )
      case 'totalStaked':
        return orderBy(
          poolsToSort,
          (pool: Pool) => (pool.isAutoVault ? totalCakeInVault.toNumber() : pool.totalStaked.toNumber()),
          'desc',
        )
      default:
        return poolsToSort
    }
  }

  const poolsToShow = () => {
    let chosenPools = []
    if (showUpcomingPools) {
      chosenPools = stakedOnly ? stakedOnlyFinishedPools : finishedPools
    } else if (showFinishedPools) {
      chosenPools = stakedOnly ? stakedOnlyFinishedPools : finishedPools
    } else {
      chosenPools = stakedOnly ? stakedOnlyOpenPools : openPools
    }

    if (searchQuery) {
      const lowercaseQuery = latinise(searchQuery.toLowerCase())
      chosenPools = chosenPools.filter((pool) =>
        latinise(pool.earningToken.symbol.toLowerCase()).includes(lowercaseQuery),
      )
    }

    return sortPools(chosenPools).slice(0, numberOfPoolsVisible)
  }

  const cardLayout = (
    <CardLayout>
      {poolsToShow().map((pool) =>
        pool.isAutoVault ? (
          <CakeVaultCard key="auto-cake" pool={pool} showStakedOnly={stakedOnly} />
        ) : (
          <PoolCard key={pool.sousId} pool={pool} account={account} />
        ),
      )}
    </CardLayout>
  )

  const tableLayout = <PoolsTable pools={poolsToShow()} account={account} userDataLoaded={userDataLoaded} />
  const { path, url, isExact } = useRouteMatch()

  const mggPool = openPools[0]
  const totalStaked = mggPool.totalStaked ? getBalanceNumber(new BigNumber(mggPool.totalStaked.toString()), mggPool.stakingToken.decimals) : 0
  const rewardPerBlock = mggPool?.tokenPerBlock ? getBalanceNumber(new BigNumber(mggPool.tokenPerBlock.toString()), mggPool.earningToken.decimals) : 0
  const {stakingPrice, rewardPrice} = usePoolPrice(mggPool.stakingToken.address[56], mggPool.earningToken.address[56])
  const apr = getPoolApr(stakingPrice, rewardPrice, totalStaked, rewardPerBlock)
  // const totalStaked = getBalanceAmount(new BigNumber(mggPool.totalStaked ?? 0)).toFormat(4)
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
                Pool Staking
              </Text>
              <Text color="text" bold style={isMobile ? { fontSize: '17px' } : { fontSize: '27px' }}>
                Earn MGG and other tokens just by Staking!
              </Text>
            </Flex>
            <InfoBox style={{ width: '100%' }} margin="20px 0px 0px 0px" justifyContent="space-between">
              <Flex flexDirection="column">
                <Text fontSize="17px" bold color={theme.colors.MGG_accent2}>
                  Total MGG Staked
                </Text>
                <Text fontSize="20px"> {totalStaked} MGG</Text>
              </Flex>
              <Flex flexDirection="column">
                <Text fontSize="17px" bold color={theme.colors.MGG_accent2}>
                  Total Value Locked
                </Text>
                <Text fontSize="20px">- USD</Text>
              </Flex>
              <Flex flexDirection="column">
                <Text fontSize="17px" bold color={theme.colors.MGG_accent2}>
                  APR
                </Text>
                <Text fontSize="20px"> {apr} % </Text>
              </Flex>
            </InfoBox>
          </Flex>
          {/* <Flex
            style={
              isMobile
                ? {
                    fontSize: '150px',
                    margin: 'auto',
                    marginTop: '20px',
                    marginBottom: '20px',
                  }
                : { fontSize: '240px', marginRight: '-118px' }
            }
          >
            <SvgIcon
              component={theme.isDark ? FarmsDarkLogo : FarmsLightLogo}
              viewBox="0  0 384 512"
              style={isMobile ? { width: '200px' } : { width: '500px' }}
              fontSize="inherit"
            />
          </Flex> */}
        </Flex>
      </PageHeader>
      <Page>
        {/* {!showFinishedPools && !showUpcomingPools && (
          <div>
            <Text bold fontSize="20px" marginLeft="24px" paddingBottom="24px">
            {' '}
            Stake tokens to earn{' '}
          </Text>
            <StyledHr style={{ marginTop: '35px', width: '100%' }} />

           // Header title for Active Pools  

            <Flex justifyContent="space-between" style={{ margin: '20px' }}>
              <Flex flexDirection="column" mr={['8px', 0]}>
                <Heading scale="md" color="text">
                  {t('Stake tokens to earn')}
                </Heading>
              </Flex>
            </Flex>
          </div>
        )} */}

        {/* UPCOMING  */}
        {showUpcomingPools && (
          <>
            <StyledHr style={{ marginTop: '35px' }} />

            <Flex justifyContent="space-between" style={{ margin: '20px' }}>
              <Flex flexDirection="column" mr={['8px', 0]}>
                <Heading scale="md" color="text">
                  {t('These pools are coming in the near future. Stay tuned.')}
                </Heading>
              </Flex>
            </Flex>
          </>
        )}

        {/* ENDED  */}
        {showFinishedPools && (
          <>
            <StyledHr style={{ marginTop: '35px' }} />

            <Flex justifyContent="space-between" style={{ margin: '20px' }}>
              <Flex flexDirection="column" mr={['8px', 0]}>
                <Heading scale="md" color="text">
                  {t('These pools are no longer distributing rewards. Please unstake your tokens.')}
                </Heading>
              </Flex>
            </Flex>
          </>
        )}

        {/* viewMode === ViewMode.CARD ? cardLayout : tableLayout */}

        {cardLayout}

        <div ref={loadMoreRef} />
        {/* <Image
          mx="auto"
          mt="12px"
          src="/images/3d-syrup-bunnies.png"
          alt="Pancake illustration"
          width={192}
          height={184.5}
        /> */}
      </Page>
    </>
  )
}

export default Pools
