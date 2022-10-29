import Login from 'mdi-material-ui/Login'
import Table from 'mdi-material-ui/Table'
import CubeOutline from 'mdi-material-ui/CubeOutline'
import HomeOutline from 'mdi-material-ui/HomeOutline'
import FormatLetterCase from 'mdi-material-ui/FormatLetterCase'
import CreditCardOutline from 'mdi-material-ui/CreditCardOutline'
import AccountPlusOutline from 'mdi-material-ui/AccountPlusOutline'
import AlertCircleOutline from 'mdi-material-ui/AlertCircleOutline'
import GoogleCirclesExtended from 'mdi-material-ui/GoogleCirclesExtended'
import Book from "mdi-material-ui/Book";
import CogTransfer from "mdi-material-ui/CogTransfer";
import { VerticalNavItemsType } from 'src/@core/layouts/types'
import {DiamondStone, StateMachine} from "mdi-material-ui";

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
      icon: () => <img src="/images/icon/ingot_icon.png" alt={"item"} width={24} height={24}/>,
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
      icon: () =>  <img src="/images/icon/craft_icon.png" alt={"craft recipe"} width={24} height={24}/>,
      path: '/config/craftRecipe'
    },
    {
      title: 'MachineRecipe',
      icon: StateMachine,
      path: '/config/machineRecipe'
    },
  ]
}

export default navigation
