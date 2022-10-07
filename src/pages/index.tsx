// ** React Imports
import { SyntheticEvent, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import { styled } from '@mui/material/styles'
import MuiTab, { TabProps } from '@mui/material/Tab'

import CubeOutline from 'mdi-material-ui/CubeOutline'
import 'react-datepicker/dist/react-datepicker.css'
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";

const Tab = styled(MuiTab)<TabProps>(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    minWidth: 100
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: 67
  }
}))

const TabName = styled('span')(({ theme }) => ({
  lineHeight: 1.71,
  fontSize: '0.875rem',
  marginLeft: theme.spacing(2.4),
  [theme.breakpoints.down('md')]: {
    display: 'none'
  }
}))

const Dashboard = () => {

  // ** State
  const [value, setValue] = useState<string>('account')

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }




  return (
    <Card>
      <TabContext value={value}>
        <TabList
          onChange={handleChange}
          aria-label='mod-settings tabs'
          sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}` }}
        >
          <Tab
            value='account'
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CubeOutline />
                <TabName>Basic</TabName>
              </Box>
            }
          />
        </TabList>

        <TabPanel sx={{ p: 0 }} value='account'>
          <CardContent>
            <form>
              <Grid container spacing={7}>

                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label='Id' disabled={true} defaultValue={""}/>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label='Author' disabled={true} defaultValue={""}/>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label='Name' defaultValue={""}/>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label='Version' defaultValue={""}/>
                </Grid>

                <Grid item xs={12} sx={{ marginTop: 4.8 }}>
                  <TextField
                    fullWidth
                    multiline
                    label='Description'
                    minRows={2}
                  />
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </TabPanel>
      </TabContext>
    </Card>
  )
}

export default Dashboard
