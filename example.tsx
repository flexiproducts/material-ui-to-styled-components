import React from 'react'
import {DrawerToggleButton} from './lib'

const someGlobal = '20px'

function App() {
  return (
    <div className={classes.first}>
      <span className={classes.second}>
        <Button className={classes.third} inactive />
        <DrawerToggleButton
          toggle="off"
          className={classes.drawerToggleButton}
        />
      </span>
    </div>
  )
}

export default App

console.log('test')
