import tokens from './tokens'
import { PoolConfig, PoolCategory, Tiers } from './types'
import farmsUIProps from './farmsUIProps'

const testConfigProps = {
  startBlock: '0x011025c8',
  endBlock: '0x011025c8',
  nonBnbPoolsTotalStaked: '0x032fbf4ce723462e3274b7',
}

const tiers: Tiers[]  = [
  {
    duration: 30,
    APR: 7
  },
  {
    duration: 90,
    APR: 12
  },
  {
    duration: 180,
    APR: 16
  },
  {
    duration: 365,
    APR: 25
  }
]

const pools: PoolConfig[] = [
  {
    isMain: true,
    sousId: 10,
    name: 'Test stake MGG1',
    stakingToken: tokens.mgg,
    earningToken: tokens.mgg,
    contractAddress: {
      97: '0xBf45bECB88766fD63cb6eCD0e66300e264ec2918',
      56: '0xBf45bECB88766fD63cb6eCD0e66300e264ec2918',
    },
    poolCategory: PoolCategory.CORE,
    harvest: true,
    tokenPerBlock: '154320987654320987',
    sortOrder: 998,
    isFinished: false,
    UIProps: farmsUIProps.mgg3,
    tiers,
    maxFine: 10,
    testHardcodeProps: testConfigProps,
  },
  {
    isMain: true,
    sousId: 11,
    name: 'Test stake MGG2',
    stakingToken: tokens.mgg,
    earningToken: tokens.mgg,
    contractAddress: {
      97: '0xe2762cf0174e9a6c91b2c040dd9b7fc892130de1',
      56: '0xe2762cf0174e9a6c91b2c040dd9b7fc892130de1',
    },
    poolCategory: PoolCategory.CORE,
    harvest: true,
    tokenPerBlock: '154320987654320987',
    sortOrder: 997,
    isFinished: false,
    UIProps: farmsUIProps.mgg2,
    tiers,
    maxFine: 10,
    testHardcodeProps: testConfigProps,
  },
  // {
  //   isMain: true,
  //   sousId: 9,
  //   name: 'MetaGaming Guild',
  //   stakingToken: tokens.mgg,
  //   earningToken: tokens.mgg,
  //   contractAddress: {
  //     97: '0x131E4A6743C942c1c564fB124fD069f96e44629B',
  //     56: '0x6506b58CEFecA9820debC9485Fc2A49E3310C869',
  //   },
  //   poolCategory: PoolCategory.CORE,
  //   harvest: true,
  //   tokenPerBlock: '154320987654320987',
  //   sortOrder: 999,
  //   isFinished: false,
  //   UIProps: farmsUIProps.mgg2,
  // },
  // Dummy Contract #1
  // {
  //   sousId: 4,
  //   stakingToken: tokens.sfuel,
  //   earningToken: tokens.sfuel,
  //   contractAddress: {
  //     97: '0xa4bf8a4abb7fd91971854ac0aade50c61afd9f1a',
  //     56: '0x9c03326543bf9a927a5ff51c407fbc444f19ca1a',
  //   },
  //   poolCategory: PoolCategory.CORE,
  //   harvest: true,
  //   tokenPerBlock: '49603174603174603',
  //   sortOrder: 999,
  //   isFinished: true,
  //   isComingSoon: true,
  // },
  // Dummy Contract #2
  // {
  //   sousId: 5,
  //   stakingToken: tokens.srkb,
  //   earningToken: tokens.sfuel,
  //   contractAddress: {
  //     97: '0xa4bf8a4abb7fd91971854ac0aade50c61afd9f3a',
  //     56: '0x9c03326543bf9a927a5ff51c407fbc444f19ca3a',
  //   },
  //   poolCategory: PoolCategory.CORE,
  //   harvest: true,
  //   tokenPerBlock: '49603174603174603',
  //   sortOrder: 999,
  //   isFinished: true,
  //   isComingSoon: false,
  // }
]

export default pools
