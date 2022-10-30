import CubeOutline from 'mdi-material-ui/CubeOutline'
import HomeOutline from 'mdi-material-ui/HomeOutline'
import Book from 'mdi-material-ui/Book'
import { VerticalNavItemsType } from 'src/@core/layouts/types'
import { DiamondStone, StateMachine } from 'mdi-material-ui'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Dashboard',
      icon: HomeOutline,
      path: '/'
    },
    {
      sectionTitle: 'Config'
    },
    {
      title: 'Item',
      icon: () => <img src='/images/icon/ingot_icon.png' alt={'item'} width={24} height={24} />,
      path: '/config/item'
    },
    {
      title: 'Block',
      icon: CubeOutline,
      path: '/config/block'
    },
    {
      title: 'Ore',
      icon: DiamondStone,
      path: '/config/ore'
    },
    {
      title: 'Quest',
      icon: Book,
      path: '/config/quest'
    },
    {
      title: 'CraftRecipe',
      icon: () => <img src='/images/icon/craft_icon.png' alt={'craft recipe'} width={24} height={24} />,
      path: '/config/craftRecipe'
    },
    {
      title: 'MachineRecipe',
      icon: StateMachine,
      path: '/config/machineRecipe'
    }
  ]
}

export default navigation
