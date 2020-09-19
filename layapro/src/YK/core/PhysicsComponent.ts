import {GameFlag} from "../utils/GameFlag"
import Sprite3D = Laya.Sprite3D
import Event = Laya.Event
import {Transform3DFlag} from "../data/Transform3DFlag"
import {GameMgr} from "../ctrl/GameMgr"
import {CannonPhysicalCtrl} from "./CannonPhysicalCtrl"

export class PhysicsComponent extends Laya.Script3D {
    public get sprite3d(): Laya.Sprite3D {
        return <Laya.Sprite3D>this.owner
    }

    protected mBody: OIMO.RigidBody

    public get Body(): OIMO.RigidBody {
        return this.mBody
    }

    public show = false
    public tranFlag = new GameFlag()
    public static canAdd = true
    public physicalCtrl: CannonPhysicalCtrl

    onAwake(): void {
        (<Sprite3D>this.owner).transform.on(Event.TRANSFORM_CHANGED, this, this.onTransformChanged)
        this.physicalCtrl = GameMgr.Inst.cannonPhysicalCtrl
        console.log("onAwake-----------")
    }


    onEnable(): void {
        this.show = true
        this.physicalCtrl.addBody(this)
    }

    onDisable(): void {
        this.show = false
        this.tranFlag.Value = 0
        this.physicalCtrl.removeBody(this)
    }

    get isValid(): boolean {
        return this.show && this.mBody != null
    }

    onDestroy(): void {
        (<Sprite3D>this.owner).transform.off(Event.TRANSFORM_CHANGED, this, this.onTransformChanged)
        this.physicalCtrl.removeBody(this)
        this.mBody = null
    }

    onTransformChanged(flag: number) {
        if (PhysicsComponent.canAdd && this.isValid) {
            flag &= Transform3DFlag.TRANSFORM_WORLDSCALE | Transform3DFlag.TRANSFORM_WORLDPOSITION | Transform3DFlag.TRANSFORM_WORLDQUATERNION
            this.tranFlag.Add(flag)
            if (this.tranFlag.Value != 0) {
                this.physicalCtrl.addToUpdateToPyList(this)
            }
        }

    }

    /**
     * 从渲染到物理刷新
     */
    updatePhysicsTransformFromRender(force = false) {

    }

    /**
     * 从物理更新到世界
     */
    updateTransformPhysicsComponent() {

    }


}
