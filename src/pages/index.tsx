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
import Mod from "../mod/loader/Mod";
import ModMeta from "../mod/loader/ModMeta";

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

let modMeta:ModMeta;
const Dashboard = () => {
  const [tabValue, setTabValue] = useState<string>('basic')
  const [id, setId] = useState<string>(Mod.instance ? Mod.instance.meta.id : '')
  const [author, setAuthor] = useState<string>(Mod.instance ? Mod.instance.meta.author : '')
  const [name, setName] = useState<string>(Mod.instance ? Mod.instance.meta.name : '')
  const [version, setVersion] = useState<string>(Mod.instance ? Mod.instance.meta.version : '')
  const [description, setDescription] = useState<string>(Mod.instance ? Mod.instance.meta.description : '')

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setTabValue(newValue)
  }

  Mod.onModUpdate.subscribe((mod) => {
    setId(mod.meta.id);
    setAuthor(mod.meta.author);
    setName(mod.meta.name);
    setVersion(mod.meta.version);
    setDescription(mod.meta.description);
    modMeta = mod.meta;
  });



  return (
    <Card>
      <TabContext value={tabValue}>
        <TabList
          onChange={handleChange}
          aria-label='mod-settings tabs'
          sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}` }}
        >
          <Tab
            value='basic'
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CubeOutline />
                <TabName>Basic</TabName>
              </Box>
            }
          />
        </TabList>

        <TabPanel sx={{ p: 0 }} value='basic'>
          <CardContent>
            <form>
              <Grid container spacing={7}>

                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label='Id' disabled={true} value={id}/>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label='Author' disabled={true} value={author}/>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label='Name' value={name} onChange={e => {
                    setName(e.target.value);
                    modMeta?.changeName(e.target.value);
                  }}  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label='Version' value={version} onChange={e => {
                    setVersion(e.target.value);
                    modMeta?.changeVersion(e.target.value);
                  }}/>
                </Grid>

                <Grid item xs={12} sx={{ marginTop: 4.8 }}>
                  <TextField
                    fullWidth
                    multiline
                    label='Description'
                    minRows={2}
                    value={description}
                    onChange={e => {
                      setDescription(e.target.value);
                      modMeta?.changeDescription(e.target.value);
                    }}
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
