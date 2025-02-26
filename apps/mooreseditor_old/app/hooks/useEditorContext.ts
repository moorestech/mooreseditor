import {useMasterDirectory} from "~/hooks/useMasterDirectory";
import {useForeignKeySystem} from "~/hooks/useForeignKeySystem";

export const useEditorContext=() => {
    const masterDirectory = useMasterDirectory();
    const foreignKeySystem = useForeignKeySystem(masterDirectory);

    return {
        masterDirectory,
        foreignKeySystem
    }
};