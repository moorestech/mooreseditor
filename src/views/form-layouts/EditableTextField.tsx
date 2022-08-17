import { TextField } from "@mui/material";
import React, {useEffect,useRef,useState} from "react";



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

const EditableTextField =  (props: { fieldValue : string,type:string}) => {


  const editNameRef = useRef<HTMLDivElement>(null);
  const [isEdit,setIsEdit] = useState<boolean>(false);
  useEffect(() => {SedEditeState(editNameRef,setIsEdit)}, []);

  return (
    <p ref={editNameRef}>
      {
        isEdit ?
        <TextField fullWidth label='Name' type={props.type} placeholder='Item Name' size={"small"} defaultValue={props.fieldValue} autoFocus={true} onFocus={e => e.target.select()}/> :
        <p>{props.fieldValue}</p>
      }

    </p>
  )
}



export default EditableTextField