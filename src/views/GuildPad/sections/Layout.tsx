import React from 'react'
import { Flex } from '@sparkpointio/sparkswap-uikit'
import styled from 'styled-components'

const Container = styled(Flex)<{ direction?: string }>`
  height: auto;
  width: 100%;
  margin-bottom: 25px;
  padding: 25px 0px;
  flex-direction: ${(props) => (props.direction ? props.direction : 'row')};
  @media (max-width: 1366px) {
    height: auto;
  }
`

const Layout: React.FC<{ direction?: string }> = ({ direction, children }) => {
  return <Container direction={direction}>{children}</Container>
}

export default Layout