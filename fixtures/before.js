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
      fontSize: '12px'
    }
  })
);

function App() {
    const classes = useStyles()

    return <div className={classes.first}>
        <span className={classes.second}>
          <Button className={classes.third} inactive />
        </span>
    </div>
}


console.log('test')