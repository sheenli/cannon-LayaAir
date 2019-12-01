import { ICom } from "../ICom";
import { BoxShapeData, BodyData } from "../../data/BodyData";
import { GameUtils } from "../../utils/GameUtils";
import { GameMgr } from "../../ctrl/GameMgr";

export class Body extends Laya.Script implements ICom {
    userData: string;
    private data: BodyData;
    private mbody: CANNON.Body;
    private mSp: Laya.Sprite3D;
    private pyWorld: CANNON.World;

    public get Body(): CANNON.Body {
        return this.mbody;
    }
    OnInit() {
        this.mSp = this.owner as Laya.Sprite3D
        this.data = JSON.parse(this.userData);
        for (let index = 0; index < this.data.shapes.length; index++) {
            this.data.shapes[index] = JSON.parse(this.data.shapes[index] as any);
        }
        this.pyWorld = GameMgr.Inst.world;
        if (this.mbody == null) {
            let op: CANNON.IBodyOptions = {

            }
            op.mass = this.data.mass;
            op.type = this.data.type;
            op.quaternion = GameUtils.layaQuaternion2CanQuaternion(this.mSp.transform.rotation);
            op.position = GameUtils.layaV32CannonV3(this.mSp.transform.position);
            op.linearDamping = this.data.linearDamping;

            this.mbody = new CANNON.Body(op);
            this.pyWorld.addBody(this.mbody);

            for (let index = 0; index < this.data.shapes.length; index++) {
                const element = this.data.shapes[index];
                if (element.type == CANNON.Shape.types.BOX) {
                    let boxData: BoxShapeData = element as BoxShapeData;
                    let size: CANNON.Vec3 = new CANNON.Vec3()
                    size.x = boxData.size.x * 0.5 * this.mSp.transform.scale.x;
                    size.y = boxData.size.y * 0.5 * this.mSp.transform.scale.y;
                    size.z = boxData.size.z * 0.5 * this.mSp.transform.scale.z;
                    let offset: CANNON.Vec3 = new CANNON.Vec3()
                    offset.x = boxData.center.x
                    offset.y = boxData.center.y
                    offset.z = boxData.center.z
                    let box = new CANNON.Box(size)
                    this.Body.addShape(box, offset)
                }
            }
        }
    }

    onDestroy() {
        if (this.mbody != null) this.pyWorld.removeBody(this.mbody);
    }

    private tempV3: Laya.Vector3 = new Laya.Vector3();
    private tempQuaternion: Laya.Quaternion = new Laya.Quaternion();

    private tempCV3: CANNON.Vec3 = new CANNON.Vec3();
    private tempCQuaternion: CANNON.Quaternion = new CANNON.Quaternion();
    onUpdate() {
        if (this.mbody == null) return
        if (this.mbody.type == CANNON.Body.DYNAMIC) {
            this.tempV3.setValue(this.mbody.position.x, this.mbody.position.y, this.mbody.position.z);
            this.mSp.transform.position = this.tempV3;
            GameUtils.SetV4(this.tempQuaternion, this.mbody.quaternion)
            this.mSp.transform.rotation = this.tempQuaternion;
        }
        else {
            this.tempCV3.set(this.mSp.transform.position.x, this.mSp.transform.position.y, this.mSp.transform.position.z);
            this.tempCQuaternion.set(this.mSp.transform.rotation.x, this.mSp.transform.rotation.y,
                this.mSp.transform.rotation.z, this.mSp.transform.rotation.w);
            this.mbody.position = this.tempCV3;
            this.mbody.quaternion = this.tempCQuaternion;
        }
    }

    updateTran() {

    }
}