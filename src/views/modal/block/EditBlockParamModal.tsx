import React, { Ref, useState, forwardRef, ReactElement } from 'react'

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
