import styled from 'styled-components'
import { Flex, Button } from '@metagg/mgg-uikit'

export const FlexC = styled(Flex)<{padding?: string}>`
  flex-flow: row wrap;
  row-gap: 1rem;
  align-content: center;
  align-items: center;
  justify-content: center;
  text-align: center;
  // max-width: 40rem;
  font-size: 12px;
  margin: 0 auto;
  ${({padding, theme}) => padding && `
    padding: ${padding};
    ${theme.mediaQueries.md} {
      padding: 2rem;
    }
  `}
  ${({theme}) => theme.mediaQueries.md} {
    font-size: 17px;
    width: 60vw;
  }
`

export const ButtonSM = styled(Button)`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  height: 2.5rem;
  border-radius: 4px;
`

export const StatCard = styled(Flex)`
  padding: 1rem;
  flex-flow: column;
  row-gap: 1rem;
  background-color: ${({ theme }) => theme.colors.MGG_mainBG};
  text-align: start;
  min-width: 21rem;
  flex: 1;
`

export const Stats = styled(Flex)`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: ${({ theme }) => theme.colors.MGG_container};
  min-width: 11rem;
`

export const TableStyle = styled.div`
  display: flex;
  position: relative;
  min-height: 15rem;
  width: 100%;
  padding: 1rem;
  overflow: auto;
  background-color: ${({ theme }) => theme.colors.MGG_mainBG};
  z-index: 2;

  table {
    width: 99%;
    position: absolute;

    th {
      text-align: start;
      margin: 0;
      padding: 0.5rem;
    }
    td {
      text-align: start;
      margin: 0;
      padding: 0.5rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`

export const ChartStyle = styled(Flex)`
  width: 100%;
  max-width: 100%;
  background-color: ${({ theme }) => theme.colors.MGG_mainBG};
  padding: 1rem;
  z-index: 3;
  .apexcharts-text {
    fill: ${({ theme }) => theme.colors.text};
  }
`


export const StyledFlex = styled(Flex)`
  justify-content: center;
`
