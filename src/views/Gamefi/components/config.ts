import BigNumber from 'bignumber.js'
import { Token } from 'config/constants/types'
import { Farm } from 'state/types'

export interface FarmWithStakedValue extends Farm {
  apr?: number
  liquidity?: BigNumber
  //
  sousId?: number
  tiers?: any
  maxFine?: string
  stakingToken?: Token
  earningToken?: Token
  stakingTokenPrice?: number
  stakingLimit?: BigNumber
  isFinished?: boolean
}
