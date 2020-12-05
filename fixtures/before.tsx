import React from 'react'
import {Theme, makeStyles, createStyles, Button} from '@material-ui/core'
import {DrawerToggleButton} from './lib'

const someGlobal = '20px'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    first: {
      flexGrow: 1
    },
    second: {
      backgroundColor: 'green',
      width: '100%'
    },
    third: {
      fontSize: '12px',
      width: someGlobal
    },
    drawerToggleButton: {
      margin: theme.spacing(2),
      width: '50px'
    }
  })
)

function App() {
  const classes = useStyles()

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
