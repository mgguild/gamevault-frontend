import React, { useState } from 'react'
import { Button, Flex } from '@metagg/mgg-uikit'
import styled from 'styled-components'
import SearchInput from 'components/SearchInput'
import { IGuildpad } from 'config/constants/types'
import PageSection from '../Layout';
import { BoxContainer, BoxHeader, TabContainer } from '../styled'
import GuildBoard from '../../components/Tab/Board'


const ButtonTab = styled(Button)<{ activeIndex: boolean; borderRadius: string }>`
  border-radius: ${({ borderRadius }) => borderRadius};
  padding: 30px;
  background-color: ${({ activeIndex, theme }) => (activeIndex ? theme.colors.MGG_active : theme.colors.MGG_container)};
`

const SearchBar = ({ searchFn }) => {
    return (
      <Flex flex={2} justifyContent="flex-end">
        <SearchInput onChange={(e) => searchFn(e.target.value)} />
      </Flex>
    )
  }
  


const Inactive:React.FC<{guildpads?: IGuildpad[] | null}> = ({guildpads}) => {
    const [ activeIndex, setActiveIndex ] = useState<number>(1)
    
    return (
        <PageSection direction='column'>
            <TabContainer>
                <ButtonTab borderRadius="10px 0px 0px 0px" onClick={() => setActiveIndex(1)} fullWidth activeIndex={activeIndex === 1}>UPCOMING LAUNCHES</ButtonTab>
                <ButtonTab borderRadius="0px 10px 0px 0px" onClick={() => setActiveIndex(2)} fullWidth activeIndex={activeIndex === 2}>PAST LAUNCHES</ButtonTab>
            </TabContainer>
            <BoxContainer>
                <GuildBoard tab={activeIndex} guildpads={guildpads} />
            </BoxContainer>
        </PageSection>
    )
}

export default Inactive;