import React, { Ref, useState, forwardRef, ReactElement } from 'react'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import Close from 'mdi-material-ui/Close'
import Mod from "../../mod/loader/Mod";
import BeltConveyorParamEditModal from "./BeltConveyorParamEditModal";
import MachineParamEditModal from "./MachineParamEditModal";


const EditBlockParamModal = (props: { isOpen:boolean,type:string,param : any, onClose: () => void ,onSubmit:(data:any) => void}) => {

  let modal:ReactElement = <></>
  switch(props.type){
    case 'Machine':
      modal = <MachineParamEditModal isOpen={props.isOpen} param={props.param} onClose={props.onClose} onSubmit={props.onSubmit}/>
      break;
    case 'BeltConveyor':
      modal = <BeltConveyorParamEditModal isOpen={props.isOpen} param={props.param} onClose={props.onClose} onSubmit={props.onSubmit}/>
      break;
  }

  return (
    <>{modal}</>
  )
}

export default EditBlockParamModal
