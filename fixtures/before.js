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
    },
  })
);

function App() {
    const classes = useStyles()

    return <div className={classes.first}>
        <span className={classes.second}>
          <Button className={classes.third} inactive />
          <Button toggle="off" className={classes.drawerToggleButton} />
        </span>
    </div>
}


console.log('test')