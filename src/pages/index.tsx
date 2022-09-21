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

// ** Icons Imports
import CubeOutline from 'mdi-material-ui/CubeOutline'
import LockOpenOutline from 'mdi-material-ui/LockOpenOutline'
import InformationOutline from 'mdi-material-ui/InformationOutline'

// ** Demo Tabs Imports
import TabInfo from 'src/views/account-settings/TabInfo'
import TabAccount from 'src/views/account-settings/TabAccount'
import TabSecurity from 'src/views/account-settings/TabSecurity'

// ** Third Party Styles Imports
import 'react-datepicker/dist/react-datepicker.css'
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Close from "mdi-material-ui/Close";
import AlertTitle from "@mui/material/AlertTitle";
import Link from "@mui/material/Link";
import Button from "@mui/material/Button";

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
          aria-label='account-settings tabs'
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
                  <TextField fullWidth label='Id'/>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label='Name'/>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label='Version'/>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label='Author'/>
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
