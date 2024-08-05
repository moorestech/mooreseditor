import {useMasterDirectory} from "~/hooks/useMasterDirectory";
import {useForeignKeySystem} from "~/hooks/useForeignKeySystem";

export const editorContext=() => {
    const masterDirectory = useMasterDirectory();
    const foreignKeySystem = useForeignKeySystem();

    return {
        masterDirectory,
        foreignKeySystem
    }
};