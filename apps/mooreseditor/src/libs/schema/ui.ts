import { ArraySchema, ObjectPropertySchema } from "./types";

export const getTableColumns = (schema: ArraySchema) => {
  if (schema.items.type !== 'object') {
    throw new Error('objectを要素に持たないarrayはテーブル表示できません');
  }
  return schema
    .items
    .properties
    .filter((property: ObjectPropertySchema) => {
      if(!('type' in property)){
        return false
      }else if(['object', 'array'].indexOf(property.type) > -1){
        return false
      }
      return true
    })
    .map(property => property.key)
}
