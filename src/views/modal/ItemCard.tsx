import Grid from "@mui/material/Grid";
import Tooltip from "@mui/material/Tooltip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import {IconButton} from "@mui/material";
import React from "react";

const ItemCard = (props: { itemName: string,url:string, onClick:() => void}) => {
  //TODO sakastudio パディングが変なのでいい感じに修正する
  return(
    <Grid item key={props.itemName} sx={{p:0}}>
      <Tooltip arrow title={props.itemName} placement='top'  sx={{p:0}}>
        <Card sx={{p:0}}>
          <CardContent sx={{width:50,height:50,p:0}}>

            <IconButton aria-label='expand row' size='small' onClick={()=>{props.onClick}}>
              <img src={props.url} alt={props.itemName} width={40} height={40} />
            </IconButton>

          </CardContent>
        </Card>
      </Tooltip>
    </Grid>
  )
}

export default ItemCard
