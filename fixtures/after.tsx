import React from 'react'
import styled from 'styled-components'
import { Button } from '@material-ui/core';
import {DrawerToggleButton} from './lib'

const someGlobal = '20px'
const loginBackground = 'https://cool.jpg'


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
  background-image: url(${loginBackground});
`;

const Third = styled(Button)`
  font-size: 12px;
  width: ${someGlobal};
`;

const StyledDrawerToggleButton = styled(DrawerToggleButton)(({theme}) => `
  margin: ${theme.spacing(2)};
  width: 50px;
`)
