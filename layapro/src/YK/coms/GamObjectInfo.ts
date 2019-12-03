export class GameObjectInfo {
    public name: string;
    public instanceID:number;
    public coms: Array<ComInfo> = new Array<ComInfo>();
    public childs: Array<GameObjectInfo> = new Array<GameObjectInfo>();
}

export class ComInfo {
    public name: string;
    public data: string;
}