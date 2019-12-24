import {GameMgr} from "../YK/ctrl/GameMgr";
import {GameObjectInfo} from "../YK/YK";

export class GameMain {
    private Plane: Laya.Sprite3D;
    private Cube: Laya.Sprite3D;
    private isDown = false;
    private brgX: number;
    private startR: number;
    mRoot: Laya.Sprite3D;

    constructor() {
        // console.log("测试4");
        Laya.loader.create(["res/unitylib/Conventional/SampleScene.ls", "res/unitylib/Conventional/SampleScene.json"], Laya.Handler.create(this, (a) => {
            let scene: Laya.Sprite3D = Laya.loader.getRes("res/unitylib/Conventional/SampleScene.ls") as Laya.Sprite3D;
            Laya.stage.addChild(scene);
            this.init();
            let goInfo: GameObjectInfo = new GameObjectInfo();
            goInfo.name = scene.name;
            goInfo.childs = Laya.loader.getRes("res/unitylib/Conventional/SampleScene.json").objInfos;
            GameMgr.Inst.comMgr.initComs(scene, goInfo);
            this.mRoot = scene.getChildByName("TestRoot") as Laya.Sprite3D;
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, (ev: Laya.Event) => {
                this.isDown = true;
                this.brgX = ev.stageX;
                this.startR = this.mRoot.transform.localRotationEulerZ;

            });
            Laya.stage.on(Laya.Event.MOUSE_UP, this, () => {
                this.isDown = false
            });

            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, (ev: Laya.Event) => {
                if (!this.isDown) return;
                const da = ev.stageX - this.brgX;
                if (Math.abs(da) > 10) {
                    this.mRoot.transform.localRotationEulerZ = (this.startR - da * 0.3) % 360;
                    // this.levelMgr.ResVelocity();
                }
            })
        }))
    }

    private PanRig: CANNON.Body;

    init() {
    }
}