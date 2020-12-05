import styled, {css} from 'styled-components'
import React from 'react'
import { Button } from '@material-ui/core';
import {DrawerToggleButton} from './lib'

const someGlobal = '20px'


function App() {
 

  return (
    <First >
      <Second >
        <Third  inactive />
        <StyledDrawerToggleButton
          toggle="off"
          
        />
      </Second>
    </First>
  )
}

export default App

console.log('test')


const First = styled.div`
  flex-grow: 1;
`;

const Second = styled.span`
  background-color: green;
  width: 100%;
`;

const Third = styled(Button)`
  font-size: 12px;
  width: ${someGlobal};
`;

const StyledDrawerToggleButton = styled(DrawerToggleButton)(({theme}) => css`
  margin: ${theme.spacing(2)};
  width: 50px;
`)
