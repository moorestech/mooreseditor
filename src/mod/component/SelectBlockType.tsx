import {MenuItem, Select} from "@mui/material";
import React from "react";
import {DefaultBlockType} from "../loader/BlockConfig";

const SelectBlockType = (props: { value: string,label:string }) => {

  return(
    <Select defaultValue={props.value} label={props.label}>
    {
      DefaultBlockType.map((type) => {
        return <MenuItem key={type} value={type}>{type}</MenuItem>
      })
    }
    </Select>
  )
}

export default SelectBlockType
