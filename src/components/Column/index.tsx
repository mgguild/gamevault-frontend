import styled from 'styled-components'
import { Flex } from '@metagg/mgg-uikit'

const Column = styled.div`
  display: grid;
`
export const AboutColumn = styled(Column)`
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto;
  width: 100%;
  max-width: 1200px;
  height: auto;
  text-align: center;
  // justify-content: center;
  column-gap: 200px;
  row-gap: 40px;
  @media (max-width: 600px) {
    grid-template-columns: repeat(1, 1fr);
    width: 80%;
  }
`

export const TierColumns = styled(Flex)`
  flex-wrap: wrap;
  justify-content: center;
`

export const TwoColumn = styled(Column)`
  grid-template-columns: repeat(2, 2fr);
  grid-template-rows: 1;
  width: 100%;
  max-width: 1200px;
  height: auto;
  text-align: left;
  justify-content: center;
  column-gap: 20px;
  row-gap: 20px;
  @media (max-width: 600px) {
    grid-template-columns: repeat(1, 1fr);
    width: 80%;
  }
`

export const TwoColumnHeader = styled(Column)`
  grid-template-columns: repeat(2, 1fr);
  // grid-template-columns: 1fr auto;
  grid-template-rows: 1;
  width: 100%;
  // max-width: 2000px;
  height: auto;
  text-align: center;
  justify-content: center;
  column-gap: 0px;
  row-gap: 0px;
  @media (max-width: 1100px) {
    grid-template-columns: repeat(1, 1fr);
    width: 100%;
    margin-left: auto;
    margin-right: auto;
  }
  @media (max-width: 600px) {
    grid-template-columns: repeat(1, 1fr);
    width: 100%;
  }
`

export const ColumnCenter = styled(Column)`
  width: 100%;
  align-items: center;
  margin: auto;
`

export const AutoColumn = styled.div<{
  gap?: 'sm' | 'md' | 'lg' | string
  justify?: 'stretch' | 'center' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'space-between'
}>`
  display: grid;
  grid-auto-rows: auto;
  grid-row-gap: ${({ gap }) => (gap === 'sm' && '8px') || (gap === 'md' && '12px') || (gap === 'lg' && '24px') || gap};
  justify-items: ${({ justify }) => justify && justify};
`

export const StyledOptions = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  @media (max-width: 450px) {
    justify-content: flex-start;
    flex-direction: column;
  }
`

export const StyledAutoColumn = styled(Column)`
  flex-direction: row;
  margin-bottom: 10px;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`

export const StyledInputContainer = styled.div`
  width: 100%;
`

export default Column
