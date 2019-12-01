import { GameMgr } from "./YK/ctrl/GameMgr";
import { GameObjectInfo } from "./YK/YK";

export class GameMain {
    private Plane: Laya.Sprite3D;
    private Cube: Laya.Sprite3D;
    constructor() {
        Laya.loader.create(["res/unitylib/Conventional/SampleScene.ls", "res/unitylib/Conventional/SampleScene.json"], Laya.Handler.create(this, (a) => {
            let scene: Laya.Sprite3D = Laya.loader.getRes("res/unitylib/Conventional/SampleScene.ls") as Laya.Sprite3D;
            Laya.stage.addChild(scene)
            this.Plane = scene.getChildByName("Plane") as Laya.Sprite3D;
            this.Cube = scene.getChildByName("Cube") as Laya.Sprite3D;
            this.init()
            let goInfo: GameObjectInfo = new GameObjectInfo();
            goInfo.name = scene.name;
            goInfo.childs = Laya.loader.getRes("res/unitylib/Conventional/SampleScene.json").objInfos;
            GameMgr.Inst.comMgr.initComs(scene, goInfo)
        }))
    }
    private PanRig: CANNON.Body;
    init() {
        // var groundBody = new CANNON.Body({
        //     mass: 0 // mass == 0 makes the body static
        // });

        // var groundShape = new CANNON.Box(new CANNON.Vec3(5, 0.01, 5));
        // groundBody.position = new CANNON.Vec3(0, 0, 0)
        // // groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
        // groundBody.addShape(groundShape);
        // GameMgr.Inst.world.addBody(groundBody)
    }
}