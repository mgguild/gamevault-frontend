import React, { useContext, useEffect, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { useWeb3React } from '@web3-react/core'
import { isNaN } from 'lodash'
import BigNumber from 'bignumber.js'
import { TwoColumn } from 'components/Column'
import { Button, Card as SCard, Flex, Heading, Progress, Text, useModal } from '@metagg/mgg-uikit'
import { getAddress } from 'utils/addressHelpers'
import tokens from 'config/constants/tokens'
import { ReactComponent as BoxCrate } from 'assets/InoCrates/INO2.svg'
import SvgIcon from 'components/SvgIcon'
import { Guildpad } from '../../../../state/types'
import UnlockButton from '../../../../components/UnlockButton'
import { getBalanceAmount } from '../../../../utils/formatBalance'
import { useBuyBox } from '../../../../hooks/useGuildPad'
import { fetchGuildpadUserDataAsync, fetchPublicGuildpadDataAsync } from '../../../../state/guildpads'
import { useAppDispatch } from '../../../../state'
import useEthBalance from '../../../../hooks/useEthBalance'
import ModalWhitelist from '../Modal/ModalWhitelist'


export interface ImgProps {
  src: string
  size?: string
}

const GCard = styled(SCard)`
  background: ${({ theme }) => theme.colors.MGG_container};
  border: 2px solid ${({ theme }) => theme.colors.MGG_active};
  border-radius: 5px;
  width: 28rem;
  margin: 0px auto;
  padding: 1rem;
`

const Cont = styled.div`
  display: flex;
  padding: 1rem;
  align-items: center;
  justify-content: center;
`

const BoxImg = styled.img<{ size?: string }>`
  width: ${({ size }) => (!size ? '80px' : size)};
  padding: 0 0.5rem 0 0;
  z-index: 2;
  @media (max-width: 500px) {
    width: ${({ size }) => (!size ? '50px' : size)};
  }
`

// const DescReward = styled.textarea<{ color?: string}>`
//   font-size: 1rem;
//   width: 100%;
//   background: ${(({theme}) => theme.colors.MGG_container)};
//   color: ${({ color }) => (!color ? '#fffff' : color)};
//   padding-top: 1.2rem;
//   resize: none;
//   border: none;
//   outline: none;
//   white-space: pre-wrap;
// `

const UnorderedList = styled.ul`
  & li {
    margin: 0.9rem;
    color: ${({ theme }) => theme.colors.textSubtle};
  }
`

const JustifyR = styled(Flex)`
  justify-content: flex-end;
`

const ColumnTwo = styled(TwoColumn)`
  max-width: 100%;
`
const GridThree = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
`
const GridTwo = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 2fr 1fr;
`

const ProgressBar: React.FC<{ token: string, guildpad: Guildpad, rarity?: string }> = (
  {
    token,
    guildpad,
    rarity = '1',
  }) => {
  const theme = useContext(ThemeContext)
  const balance = useEthBalance()
  const tokenBalanceAmount = getBalanceAmount(balance, guildpad.buyingCoin.decimals)

  let remainingText = ''
  if (guildpad.buyLimitEnabled) {
    remainingText = `out of ${guildpad.buyLimit}`
  }
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ColumnTwo>
        <Text>Remaining Boxes:</Text>
        <JustifyR>
          {/* <BoxImg size="1.8rem" src={`/images/tokens/${token}.svg`} alt="BNB" /> */}
          <Text>
            {guildpad.boxInfo[rarity].supply - guildpad.boxInfo[rarity].sold}/{guildpad.boxInfo[rarity].supply} Boxes
          </Text>
        </JustifyR>
      </ColumnTwo>
      <ColumnTwo>
        <Text>Price per Box:</Text>
        <JustifyR>
          {/* <BoxImg size="1.8rem" src={`/images/tokens/${token}.svg`} alt="BNB" /> */}
          <div style={{textAlign: 'right'}}>
            <Text fontSize='15px'>{guildpad.boxInfo[rarity].price} BNB (1425 WBOND)</Text>
            <Text fontSize='12px'>(<em>as of Feb 18, 2022 8PM GMT+8</em>)</Text>
          </div>
        </JustifyR>
      </ColumnTwo>
      <ColumnTwo>
        <Text>Balance:</Text>
        <JustifyR>
          {/* <BoxImg size="1.8rem" src={`/images/tokens/${token}.svg`} alt="BNB" /> */}
          <Text>{tokenBalanceAmount.toPrecision(6)} BNB</Text>
        </JustifyR>
      </ColumnTwo>
      <div style={{ textAlign: 'center', padding: '1rem 0 0 0'}}>
        <Progress
          variant='round'
          primaryStep={guildpad.boxInfo[rarity].percentSold}
        />
        <Text>{guildpad.boxInfo[rarity].percentSold}%</Text>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Text small color={theme.colors.textSubtle}>You own <span
          style={{ color: 'white' }}>{guildpad.userData.boxesBought}</span> boxes {remainingText}</Text>
      </div>
    </div>
  )
}

const RewardInfo: React.FC<{ guildpad: Guildpad }> = ({ guildpad }) => {
  return (
    <>
      {
        guildpad.boxDetails.rewardList.map((reward) => {
          return (
            <div>
              <Text>{reward.description}</Text>
              {// If reward.rearitLevels exists
                reward.rarityLevels &&
                <UnorderedList>
                  {
                    reward.rarityLevels.map((rarityLevel) => {
                      return (<li>{rarityLevel}</li>)
                    })
                  }
                </UnorderedList>
              }
            </div>
          )
        })
      }
      <Text>{guildpad.boxDetails.redeemInfo}</Text>
    </>
  )
}


const BoxCard: React.FC<{ guildpad: Guildpad, imgProps: ImgProps, userDataLoaded: boolean }> = ({ guildpad, imgProps, userDataLoaded }) => {
  const [rarityId, setRarityId] = useState('1') // TODO: For dynamic in case there are multiple types of boxes for sale
  const [buyQuantity, setBuyQuantity] = useState(0)
  const [buyDisabled, setBuyDisabled] = useState(false)
  const [whitelistModalShowed, setWhitelistModalShowed] = useState(false)
  const { account } = useWeb3React()
  const theme = useContext(ThemeContext)
  const { src, size } = imgProps
  const img = `/images/guildpad-assets/${src}`
  const dispatch = useAppDispatch()
  const { onBuyBox } = useBuyBox(getAddress(guildpad.contractAddress))
  const handleBuy = async () => {
    const ids = [guildpad.id]
    await onBuyBox(rarityId, new BigNumber(buyQuantity).multipliedBy(new BigNumber(guildpad.boxInfo[rarityId].price)).toString())
    dispatch(fetchPublicGuildpadDataAsync([guildpad.id]))
    dispatch(fetchGuildpadUserDataAsync({ account, ids }))
  }

  const limitReached = (quantity) => {
    const totalOwnedToOwn = parseInt(guildpad.userData.boxesBought) + parseInt(quantity)
    if (guildpad.buyLimitEnabled && totalOwnedToOwn > parseInt(guildpad.buyLimit)) {
      return true
    }
    return false
  }
  const onChange = (e) => {
    const quantity = e.target.value
    if (!quantity || isNaN(parseInt(quantity))) {
      setBuyQuantity(0)
      return
    }
    if (limitReached(quantity)) {
      setBuyDisabled(true)
    } else {
      setBuyDisabled(false)
    }
    setBuyQuantity(parseInt(quantity))
  }
  // SHOW MODAL WHITELIST
  const [showNotInWhitelistModal] = useModal(
    <ModalWhitelist onDismiss={() => {
      setWhitelistModalShowed(false)
    }} dateInMilli={guildpad.nextRoundDate} />,
  )

  useEffect(() => {
    if (account && guildpad.whitelistEnabled && !guildpad.userData.isWhitelisted && !whitelistModalShowed && userDataLoaded) {
      showNotInWhitelistModal()
      setWhitelistModalShowed(true)
    }
  }, [account, guildpad, showNotInWhitelistModal, whitelistModalShowed, userDataLoaded])

  const hasRemainingSupply = (guildpad.boxInfo[rarityId].supply - guildpad.boxInfo[rarityId].sold) > 1 // SET TO 1 cause of last 1 box Problem
  return (
    <GCard>
      <div style={{ padding: '1rem 1rem' }}>
        <Cont>
          {/* <BoxImg src={img} size={size}/> */}
          <div className='img-shadow'>
            <SvgIcon Icon={BoxCrate} />
          </div>
        </Cont>
        <Flex style={{ paddingTop: '2rem', justifyContent: 'center' }}>
          <Heading size='lg' color={theme.colors.primary}>
            Mystery Box
          </Heading>
        </Flex>
        <Flex>
          <div style={{ padding: '1.2rem 0 2rem 0' }}>
            {guildpad.boxDetails ? <RewardInfo guildpad={guildpad} /> : 'No boxDetails Info'}
          </div>
        </Flex>
        <Flex>
          <ProgressBar token={getAddress(tokens.wbnb.address)} guildpad={guildpad} rarity={rarityId} />
        </Flex>
        <Flex style={{ padding: '1rem 0 0 0' }}>
          {!account && <UnlockButton fullWidth />}
          {account && !hasRemainingSupply &&
          <Button fullWidth
                  style={{ backgroundColor: 'rgba(41, 178, 19, 1)', borderRadius: '5px' }}>
            SOLD OUT
          </Button>}
          {
            account && hasRemainingSupply &&
            <GridTwo>
              <input disabled={guildpad.whitelistEnabled && !guildpad.userData.isWhitelisted} style={{borderRadius: '0.5rem 0 0 0.5rem', padding: '0.5rem', border: 'none'}} placeholder='Qty.'
                     name='buyQuantity' value={buyQuantity} onChange={onChange} />
              <JustifyR>
                <Button disabled={(guildpad.whitelistEnabled && !guildpad.userData.isWhitelisted) || buyDisabled || buyQuantity <= 0}
                        onClick={handleBuy}
                        fullWidth
                        style={{ backgroundColor: 'rgba(41, 178, 19, 1)', borderRadius: '0 0.5rem 0.5rem 0' }}>
                  Buy
                </Button>
              </JustifyR>
            </GridTwo>
          }
        </Flex>
      </div>
    </GCard>
  )
}

export default BoxCard
