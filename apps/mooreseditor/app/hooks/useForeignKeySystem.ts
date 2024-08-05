import {useMasterDirectory} from "./useMasterDirectory";

export const useForeignKeySystem = () => {
    const masterDirectory = useMasterDirectory()

    const parseForeignKey = (foreignKey: string): [schemaId:string, idPropName:string, labelPropName:string] => {
        const [schemaId, idPropName, labelPropName] = foreignKey.split(':')
        return [schemaId, idPropName, labelPropName]
    }

    const getForeignTable = (foreignKey: string): any  => {
        const [schemaId, idPropName, labelPropName] = parseForeignKey(foreignKey)

        return (masterDirectory.getEntries(schemaId))?.data.map((row: any) => ({
            value: row[idPropName],
            label: row[labelPropName]
        }))
    }

    const getForeignValue = (foreignKey: string, id: any): any => {
        return null;
        const table = getForeignTable(foreignKey)
        for (const row of table) {
            if (row.value === id) {
                return row.label
            }
        }

        return null
    }

    return {
        getForeignTable,
        getForeignValue,
    }
}