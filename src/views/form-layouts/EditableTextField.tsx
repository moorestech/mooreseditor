import { TextField } from "@mui/material";
import React, {useEffect,useRef,useState} from "react";
import Typography from "@mui/material/Typography";



const SedEditeState = (ref: React.RefObject<HTMLDivElement>,editAction: (state:boolean) => void) => {
  const keyDownHandler = (event : KeyboardEvent) => {

    if (event.key === 'Enter' || event.key === 'Escape') {
      event.preventDefault();
      editAction(false);
    }
  }
  document.addEventListener('keydown', keyDownHandler);



  const el = ref.current;
  if (!el) return;
  const handleClickOutside = (e: MouseEvent) => {
    editAction(el?.contains(e.target as Node));
  };
  document.addEventListener("click", handleClickOutside);

  return () => {
    document.removeEventListener("click", handleClickOutside);
    document.removeEventListener('keydown',keyDownHandler);
  }
}
const EditableTextField =  (props: { fieldValue : string,type:string,label : string,placeholder:string,onEdit:(value: string) => void}) => {


  const editNameRef = useRef<HTMLDivElement>(null);
  const [isEdit,setIsEdit] = useState<boolean>(false);
  const [value,setValue] = useState<string>(props.fieldValue);
  useEffect(() => {SedEditeState(editNameRef,setIsEdit)}, []);

  return (
    <div ref={editNameRef}>
      {
        isEdit ?
        <TextField fullWidth label={props.label} type={props.type} placeholder={props.placeholder} size={"small"} defaultValue={props.fieldValue} autoFocus={true}
                   value={value}
                   onFocus={e => e.target.select()}
                   onChange={(e) => {
                     setValue(e.target.value);
                     props.onEdit(e.target.value)
                   }}
        /> :
        <Typography variant='body2'>
          {props.fieldValue}
        </Typography>
      }

    </div>
  )
}



export default EditableTextField
