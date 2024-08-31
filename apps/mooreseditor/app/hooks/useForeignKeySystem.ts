import {useMasterDirectory} from "./useMasterDirectory";

export const useForeignKeySystem = (master: ReturnType<typeof useMasterDirectory>) => {

    const parseForeignKey = (foreignKey: string): [schemaId:string, idPropName:string, labelPropName:string] => {
        const [schemaId, idPropName, labelPropName] = foreignKey.split(':')
        return [schemaId, idPropName, labelPropName]
    }

    const getForeignTable = (foreignKey: string): any  => {
        const [schemaId, idPropName, labelPropName] = parseForeignKey(foreignKey)

        return (master.getEntries(schemaId))?.data.map((row: any) => ({
            value: row[idPropName] ?? "value " + idPropName + "が未設定",
            label: row[labelPropName] ?? row[idPropName] ?? "labelが未設定",
        }))
    }

    const getForeignValue = (foreignKey: string, id: any): any => {
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