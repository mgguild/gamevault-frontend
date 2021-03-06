/* eslint-disable import/prefer-default-export */

import styled from 'styled-components'
import { Flex } from '@metagg/mgg-uikit'

export const DetailsContainer = styled(Flex)`
  width: 80%;
  & > * {
    margin: 15px 20px;
  }
`

export const MainContainer = styled(Flex)`
  width: 100%;
  padding: 10px;
  @media (max-width: 768px) {
    flex-direction: column;
    & > * {
      margin: 10px 0px;
    }
  }
`

export const MainForm = styled(Flex)``
