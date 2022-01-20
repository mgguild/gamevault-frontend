import React, { useContext } from 'react';
import { Flex, Text, Button } from '@metagg/mgg-uikit';
import { ThemeContext } from 'styled-components';
import Balance from 'components/Balance'
import { ActionContainer, ActionContent, ActionTitles, Earned } from '../../../Farms/components/FarmTable/Actions/styles';


const ClaimAction: React.FC = () => {
    const theme = useContext(ThemeContext)
    return (
        <ActionContainer style={{ margin: '10px 0' }}>
      <ActionTitles>
        <Text bold textTransform='uppercase' color={theme.colors.MGG_accent2} fontSize='12px' pr='4px'>
          MGG
        </Text>
        <Text bold textTransform='uppercase' color='textSubtle' fontSize='12px'>
          Earned
        </Text>
      </ActionTitles>
      <ActionContent>
        <div>
          <Earned>0</Earned>
        </div>
        <Button
          style={{borderRadius: '3px', height: '40px'}}
          disabled
          ml='4px'
        >
          Claim
        </Button>
      </ActionContent>
    </ActionContainer>
    )
}

export default ClaimAction