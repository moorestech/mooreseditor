// ** MUI Imports
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'

const FooterContent = () => {
  // ** Var
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography sx={{ mr: 2 }}></Typography>
      {hidden ? null : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', '& :not(:last-child)': { mr: 4 } }}>
          <Link target='_blank' href='https://twitter.com/sakastudio_'>
            Twitter
          </Link>
          <Link target='_blank' href='https://discord.gg/XrR9fwwfsb'>
            Discord
          </Link>
          <Link target='_blank' href='https://moorestech.github.io/moorestech_doc/'>
            Documentation
          </Link>
        </Box>
      )}
    </Box>
  )
}

export default FooterContent
