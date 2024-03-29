// ** MUI Imports
import Box from '@mui/material/Box'
import { Theme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import useMediaQuery from '@mui/material/useMediaQuery'
import InputAdornment from '@mui/material/InputAdornment'

// ** Icons Imports
import Menu from 'mdi-material-ui/Menu'
import Magnify from 'mdi-material-ui/Magnify'

// ** Type Import
import { Settings } from 'src/@core/context/settingsContext'

// ** Components
import ModeToggler from 'src/@core/layouts/components/shared-components/ModeToggler'
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'
import NotificationDropdown from 'src/@core/layouts/components/shared-components/NotificationDropdown'
import Button from '@mui/material/Button'
import EfaOpenDirectory from '../../../easyFileAccessor/EfaOpenDirectory'
import Mod from '../../../mod/loader/Mod'
import ModMeta from '../../../mod/loader/ModMeta'
import ItemConfig from '../../../mod/loader/ItemConfig'
import { BlockConfig } from '../../../mod/loader/BlockConfig'
import { CraftRecipeConfig } from '../../../mod/loader/CraftRecipeConfig'
import { MachineRecipeConfig } from '../../../mod/loader/MachineRecipeConfig'

interface Props {
  hidden: boolean
  settings: Settings
  toggleNavVisibility: () => void
  saveSettings: (values: Settings) => void
}

async function OpenProject() {
  try {
    const dirHandle = await EfaOpenDirectory()
    const metaFile = await dirHandle.getFileHandle('modMeta.json')
    const modMeta = await ModMeta.CreateModMeta(metaFile)

    const itemConfigFile = await dirHandle.getFileHandle('config/item.json')
    const itemConfig = await ItemConfig.CreateItemConfig(itemConfigFile, dirHandle, modMeta.mergedId)
    const blockConfig = await BlockConfig.CreateBlockConfig(await dirHandle.getFileHandle('config/block.json'))
    const craftConfig = await CraftRecipeConfig.CreateCraftRecipeConfig(
      await dirHandle.getFileHandle('config/craftRecipe.json'),
      itemConfig.items
    )
    const machineConfig = await MachineRecipeConfig.CreateMachineRecipeConfig(
      await dirHandle.getFileHandle('config/machineRecipe.json')
    )

    //Modクラスは作られた時点でイベントが発火されるので、このままでOK
    new Mod(modMeta, itemConfig, blockConfig, craftConfig, machineConfig)
  } catch (e) {
    console.log(e)
  }
}

const AppBarContent = (props: Props) => {
  // ** Props
  const { hidden, settings, saveSettings, toggleNavVisibility } = props

  // ** Hook
  const hiddenSm = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box className='actions-left' sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
        <Button size='small' variant='contained' onClick={OpenProject}>
          Open Project
        </Button>

        {hidden ? (
          <IconButton
            color='inherit'
            onClick={toggleNavVisibility}
            sx={{ ml: -2.75, ...(hiddenSm ? {} : { mr: 3.5 }) }}
          >
            <Menu />
          </IconButton>
        ) : null}
        <TextField
          size='small'
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Magnify fontSize='small' />
              </InputAdornment>
            )
          }}
        />
      </Box>
      <Box className='actions-right' sx={{ display: 'flex', alignItems: 'center' }}>
        {hiddenSm ? null : (
          <Box
            component='a'
            target='_blank'
            rel='noreferrer'
            sx={{ mr: 4, display: 'flex' }}
            href='https://github.com/moorestech/mooreseditor'
          >
            <img
              height={24}
              alt='github stars'
              src='https://img.shields.io/github/stars/moorestech/mooreseditor?style=social'
            />
          </Box>
        )}
        <ModeToggler settings={settings} saveSettings={saveSettings} />
        <NotificationDropdown />
        <UserDropdown />
      </Box>
    </Box>
  )
}

export default AppBarContent
