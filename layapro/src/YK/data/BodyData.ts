export class BodyData {
    public mass: number;
    public type: number;
    public linearDamping: number;
    public constraints: number;
    public shapes: Array<ShapeData> = new Array<ShapeData>();
}

export class ShapeData {
    type: number;
}

export class BoxShapeData extends ShapeData {
    public center: CANNON.Vec3;
    public size: CANNON.Vec3;
}