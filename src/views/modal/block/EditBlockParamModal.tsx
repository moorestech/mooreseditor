import React, { ReactElement, useState, useEffect } from 'react'
import Grid from '@mui/material/Grid'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { BlockParamsType, BlockParamValueType, BlockParamsSchemaType } from "../../../mod/BlockParamsType"

interface Props {
  isOpen: boolean
  type: string
  param: BlockParamsType
  onClose: () => void
  onSubmit: (data: any) => void
}

const EditBlockParamModal = ({
  isOpen,
  type,
  param,
  onClose,
  onSubmit,
}: Props) => {
  const [newParams, setNewParams] = useState<BlockParamsType>({})
  const schema = getBlockSchema(type);

  const updateParam = (paramName: string, value: BlockParamValueType) => {
    setNewParams({
      ...newParams,
      [paramName]: value
    })
  }

  useEffect(() => {
    setNewParams(param)
  }, [])

  return (
    <Dialog
      fullWidth
      maxWidth='md'
      scroll='body'
      onClose={() => onClose()}
      onBackdropClick={() => onClose()}
      open={isOpen}
    >
      <DialogContent sx={{ px: 15, py: 15, pt: 8 }}>
        <Grid container spacing={6}>
          <Grid item sm={12} sx={{ textAlign: 'center' }}>
            <Typography variant='h4'>Edit Machine Parameters</Typography>
          </Grid>

          <Grid container spacing={6}>
            {schema ? Object.keys(schema).map(paramName => (
              <BlockParamInputRow key={paramName} schema={schema[paramName]} onChange={(value: BlockParamValueType) => updateParam(paramName, value)} />
            )) : null}
            <Grid item sm={6} xs={12}>
              <TextField
                error={inputIsError}
                fullWidth
                defaultValue={inputSlot}
                label='Input Slot'
                placeholder='Input Slot'
                type={'number'}
                onChange={event => {
                  inputSlot = parseInt(event.target.value)
                  setInputIsError(inputSlot < 0)
                }}
                helperText={inputIsError ? 'Input Slot must be greater than 0' : ''}
              />
            </Grid>
            <Grid item sm={6} xs={12}>
              <TextField
                error={outputIsError}
                fullWidth
                defaultValue={outputSlot}
                label='Output Slot'
                placeholder='Output Slot'
                type={'number'}
                onChange={event => {
                  outputSlot = parseInt(event.target.value)
                  setOutputIsError(outputSlot < 0)
                }}
                helperText={outputIsError ? 'Output Slot must be greater than 0' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                error={requiredPowerIsError}
                fullWidth
                defaultValue={requiredPower}
                label='Required Power'
                placeholder='Required Power'
                type={'number'}
                onChange={event => {
                  requiredPower = parseInt(event.target.value)
                  setRequiredPowerIsError(requiredPower < 0)
                }}
                helperText={requiredPowerIsError ? 'Required Power must be greater than 0' : ''}
              />
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button
          variant='contained'
          sx={{ mr: 1 }}
          onClick={() => {
            const param = {
              inputSlot: inputSlot,
              outputSlot: outputSlot,
              requiredPower: requiredPower

            }
            let newParams: BlockParamsType = {};
            schemas.map(schema => {
              newParams[schema.name] = param[schema.name]
            })
            onSubmit(newParams)
          }}
        >
          Submit
        </Button>
        <Button variant='outlined' color='secondary' onClick={() => onClose()}>
          Discard
        </Button>
      </DialogActions>
    </Dialog>
  )

}

const getBlockSchema = (type: string): BlockParamsSchemaType | null => {
  switch(type){
    case "Machine":
      return {
        "inputSlot": {
          type: "int",
          defaultValue: 1,
        },
        "outputSlot": {
          type: "int",
          defaultValue: 1,
        },
        "requiredPower": {
          type: "int",
          defaultValue: 100,
        }
      }
    default:
      return null
  }
}

interface BlockParamInputRowProps {
  schemas: BlockParamsSchemaType,
  params: BlockParamsType
  onChange: (params: BlockParamsType) => void
}

const  BlockParamInputRow = () => {
  return (
    <Grid container spacing={6}>
      {(() => {
        if(schemas instanceof Array){
          return schemas.map(schema => (
            <Grid item sm={6} xs={12} key={schema.name}>
              {(() => {
                if(schema instanceof Array){
                  schema.map(schema => {
                    switch(schema.type){
                      case "int":
                      case "float":
                        {
                          return (
                            <BlockParamNumberField
                              isError={false}
                              label={schema.name}
                              placeholder={schema.name}
                              value={params[schema.name]}
                              onChange={(value: number) => {
                                onChange({
                                  ...params,
                                  [schema.name]: value
                                })
                              }}
                            />
                          )
                        }
                      case "string":
                        return <BlockParamTextField />
                      case "struct":
                        return <BlockParamInputRow schemas={schema} />
                    }
                  })
                }else{
                  if(schema.type === "int" || schema.type === "float"){
                    return <BlockParamNumberField />
                  }else if(schema.type === "string"){
                    return <BlockParamTextField />
                  }
                }
              })()}
            </Grid>
          ))
        }
      })()}
    </Grid>
  )
}

interface BlockParamNumberFieldProps {
  isError: boolean;
  label: string;
  placeholder: string;
  value: number;
  onChange(value: number): void;

}

const BlockParamNumberField = ({
  isError,
  label,
  placeholder,
  value,
  onChange,
}: BlockParamNumberFieldProps) => {
  return (
    <TextField
      error={isError}
      fullWidth
      defaultValue={value}
      label={label}
      placeholder={placeholder}
      type={"number"}
      onChange={event => {
        onChange(parseInt(event.target.value))
      }}
    />
  )
}

interface BlockParamTextFieldProps {
  isError: boolean;
  label: string;
  placeholder: string;
  value: string;
  onChange(value: string): void;
}

const BlockParamTextField = ({
  isError,
  label,
  placeholder,
  value,
  onChange,
}: BlockParamTextFieldProps) => {
  return (
    <TextField
      error={isError}
      fullWidth
      defaultValue={value}
      label={label}
      placeholder={placeholder}
      type={"text"}
      onChange={event => {
        onChange(event.target.value)
      }}
    />
  )
}

interface BlockParamBoolFieldProps {
  isError: boolean;
  label: string;
  value: boolean;
  onChange(value: bool): void;
}

const BlockParamBoolField = ({
  label,
  value,
  onChange,
}: BlockParamBoolFieldProps) => {
  return (
    <FormControlLabel
      label={label}
      control={
        <Checkbox
          checked={value}
          onChange={event => {
            onChange(event.target.checked)
          }}
        />
      }
    />
  )
}

export default EditBlockParamModal
