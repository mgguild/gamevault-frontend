import BigNumber from 'bignumber.js'
import { Token, Address, Tiers } from 'config/constants/types'
import { Farm } from 'state/types'

export interface FarmWithStakedValue extends Farm {
  apr?: number
  liquidity?: BigNumber
  //
  sousId?: number
  tiers?: Tiers[]
  maxFine?: number
  stakingToken?: Token
  earningToken?: Token
  stakingTokenPrice?: number
  stakingLimit?: BigNumber
  isFinished?: boolean
  contractAddress?: Address
}
