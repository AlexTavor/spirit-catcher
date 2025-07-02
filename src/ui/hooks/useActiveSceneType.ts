import React from "react";

type SceneType = "editor" | "game";

const listeners = new Set<(type: SceneType) => void>();
let currentSceneType: SceneType = "game";

export function setSceneType(type: SceneType) {
    currentSceneType = type;
    listeners.forEach((fn) => fn(type));
}

export function useActiveSceneType(): SceneType {
    const [sceneType, setSceneTypeState] = React.useState(currentSceneType);

    React.useEffect(() => {
        const fn = (type: SceneType) => setSceneTypeState(type);
        listeners.add(fn);
        return () => {
            listeners.delete(fn);
        };
    }, []);

    return sceneType;
}
