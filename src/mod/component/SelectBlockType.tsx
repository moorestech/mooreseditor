import {MenuItem, Select} from "@mui/material";
import React from "react";
import {DefaultBlockType} from "../loader/BlockConfig";

const SelectBlockType = (props: { value: string,label:string,onChange:(type: string) => void }) => {

  return(
    <Select defaultValue={props.value} label={props.label}
            onChange={(e) => {
              props.onChange(e.target.value as string);
            }}
    >
    {
      DefaultBlockType.map((type) => {
        return <MenuItem key={type} value={type}>{type}</MenuItem>
      })
    }
    </Select>
  )
}

export default SelectBlockType
