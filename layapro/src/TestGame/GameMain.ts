import {GameMgr} from "../YK/ctrl/GameMgr"
import {GameObjectInfo} from "../YK/YK"
import {GameUtils} from "../YK/utils/GameUtils"

export class GameMain {
    private Plane: Laya.Sprite3D
    private Cube: Laya.Sprite3D
    private isDown = false
    private brgX: number
    private startR: number
    mRoot: Laya.Sprite3D
    mTest: Laya.Sprite3D

    constructor() {
        // console.log("测试4");
        Laya.loader.create(["res/unitylib/Conventional/SampleScene.ls",
            "res/unitylib/Conventional/SampleScene.json",
            "res/unitylib/Conventional/original.lh",
            "res/unitylib/Conventional/original.json"
        ], Laya.Handler.create(this, (a) => {
            let scene: Laya.Sprite3D = Laya.loader.getRes("res/unitylib/Conventional/SampleScene.ls") as Laya.Sprite3D
            Laya.stage.addChild(scene)

            let goInfo: GameObjectInfo = new GameObjectInfo()
            goInfo.name = scene.name
            goInfo.childs = Laya.loader.getRes("res/unitylib/Conventional/SampleScene.json").objInfos
            GameMgr.Inst.comMgr.initComs(scene, goInfo)
            this.mRoot = scene.getChildByName("Root") as Laya.Sprite3D
            this.mTest = scene.getChildByName("Root") as Laya.Sprite3D
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, (ev: Laya.Event) => {
                this.isDown = true
                this.brgX = ev.stageX
                this.startR = this.mRoot.transform.localRotationEulerZ

            })
            Laya.stage.on(Laya.Event.MOUSE_UP, this, () => {
                this.isDown = false
            })

            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, (ev: Laya.Event) => {
                if (!this.isDown) return
                const da = ev.stageX - this.brgX
                if (Math.abs(da) > 10) {
                    this.mRoot.transform.localRotationEulerZ = (this.startR - da * 0.3) % 360
                    // this.levelMgr.ResVelocity();
                }
            })
            this.init()
        }))
    }

    // private PanRig: CANNON.Body;
    public static random(m, n): number {
        let num = Math.floor(Math.random() * (m - n) + n)
        return num
    }

    public static CUBENUM = 200

    init() {
        let original = Laya.loader.getRes("res/unitylib/Conventional/original.lh")
        for (let i = 0; i < GameMain.CUBENUM; i++) {
            let gameInfo: GameObjectInfo = Laya.loader.getRes("res/unitylib/Conventional/original.json")
            let cube = original.clone() as Laya.Sprite3D
            this.mTest.addChild(cube)
            cube.transform.localPositionY = GameMain.random(3, 15)
            cube.transform.localPositionX = GameMain.random(-20, 20)
            cube.transform.localPositionZ = GameMain.random(-20, 20)
            GameMgr.Inst.comMgr.initComs(cube, gameInfo)
        }
    }
}
