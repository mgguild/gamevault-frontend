import React, { lazy } from 'react'
import { useWeb3React } from '@web3-react/core'
import { HashRouter, Redirect, Route, Switch } from 'react-router-dom'
import { ResetCSS } from '@metagg/mgg-uikit'
import BigNumber from 'bignumber.js'
import useEagerConnect from 'hooks/useEagerConnect'
import { useFetchProfile, usePollBlockNumber, usePollCoreFarmData } from 'state/hooks'
import { RedirectToFarms } from 'views/Farms/Redirects'
import GlobalStyle from './style/Global'
import Menu from './components/Menu'
import SuspenseWithChunkError from './components/SuspenseWithChunkError'
import ToastListener from './components/ToastListener'
import PageLoader from './components/PageLoader'
import EasterEgg from './components/EasterEgg'
import NotSupported from './views/ComingSoon/notSupported'
import { getSupportedChain, isChainSupported } from './utils/settings'
// import Pools from './views/Pools'

// Route-based code splitting
// Only pool is included in the main bundle because of it's the most visited page
const Farms = lazy(() => import('./views/Farms'))
const Pools = lazy(() => import('./views/Pools'))
const Gamefi = lazy(() => import('./views/Gamefi'))
const ComingSoon = lazy(() => import('./views/ComingSoon'))
const Guildpad = lazy(() => import('./views/GuildPad'))
const NotFound = lazy(() => import('./views/NotFound'))
const Pad = lazy(() => import('./views/GuildPad/Pad'))
const GamefiPage = lazy(() => import('./views/Gamefi/NewUI/StakingPage'))

// This config is required for number formatting
BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

const ExternalRedirect = ({ to, ...routeProps }) => {
  return <Redirect to={to} />
}

const App: React.FC = () => {
  const { chainId } = useWeb3React()
  usePollBlockNumber()
  useEagerConnect()
  useFetchProfile()
  usePollCoreFarmData()

  return (
    <HashRouter>
      <ResetCSS />
      <GlobalStyle />
      <Menu>
        <SuspenseWithChunkError fallback={<PageLoader />}>
          <Switch>
            <Route path="/farms">
              {isChainSupported('LP_STAKING', chainId) ? (
                <Farms />
              ) : (
                <NotSupported title="Farms" supportedChainId={getSupportedChain('LP_STAKING')} />
              )}
            </Route>
            <Route path="/pools" exact>
              {isChainSupported('POOL_STAKING', chainId) ? (
                <Pools />
              ) : (
                <NotSupported title="Pools" supportedChainId={getSupportedChain('POOL_STAKING')} />
              )}
              {/* <ComingSoon title="Pools" /> */}
            </Route>
            <Route path="/gamefi" exact>
              {isChainSupported('GAMEFI', chainId) ? (
                <Gamefi />
              ) : (
                <NotSupported title="Gamefi Vaults" supportedChainId={getSupportedChain('GAMEFI')} />
              )}
            </Route>
            <Route
              path="/gamefi/:type/:farmID"
              component={isChainSupported('GAMEFI', chainId) ? GamefiPage : NotSupported}
            />
            {/* <Route path="/gamefi/:type/:farmID"
              component={(props) => {
                const { farmID, type } = props.match.params
                return isChainSupported('LAUNCHPAD', chainId) ? (
                  <GamefiPage farmID={farmID} type={type} />
                ) : (
                  <NotSupported title="Gamefi" supportedChainId={getSupportedChain('GAMEFI')} />
                )
              }}
            /> */}
            {/* <ComingSoon title="GameFi Vaults" /> */}

            <Route path="/launchpad" exact>
              {/* <ComingSoon title="Launchpad" /> */}
              {isChainSupported('LAUNCHPAD', chainId) ? (
                <Guildpad />
              ) : (
                <NotSupported title="Guildpad" supportedChainId={getSupportedChain('LAUNCHPAD')} />
              )}
            </Route>
            <Route path="/" exact>
              {/* <ComingSoon title="Launchpad" /> */}
              {isChainSupported('LAUNCHPAD', chainId) ? (
                <Guildpad />
              ) : (
                <NotSupported title="Guildpad" supportedChainId={getSupportedChain('LAUNCHPAD')} />
              )}
            </Route>
            <Route
              path="/launchpad/:guildpadTitle"
              component={(props) => {
                const { guildpadTitle } = props.match.params
                return isChainSupported('LAUNCHPAD', chainId) ? (
                  <Pad guildpadTitle={guildpadTitle} />
                ) : (
                  <NotSupported title="Guildpad" supportedChainId={getSupportedChain('LAUNCHPAD')} />
                )
              }}
            />
            <Route path="/earning-dashboard" exact>
              <ComingSoon title="Earning Dashboard" />
            </Route>
            <Route path="/staking">
              <Redirect to="/farms" />
            </Route>
            <Route path="/" component={RedirectToFarms} />
            {/* 404 */}
            <Route component={NotFound} />
            {/* External link for redirect */}
            <ExternalRedirect exact path="/apply" to="https://www.google.com" />
          </Switch>
        </SuspenseWithChunkError>
      </Menu>
      <EasterEgg iterations={2} />
      <ToastListener />
    </HashRouter>
  )
}

export default React.memo(App)
