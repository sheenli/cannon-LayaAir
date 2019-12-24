import {ICom} from "../ICom";
import {BoxShapeData, BodyData} from "../../data/BodyData";
import {GameUtils} from "../../utils/GameUtils";
import {GameMgr} from "../../ctrl/GameMgr";
import {GameFlag} from "../../utils/GameFlag";
import {Transform3DFlag} from "../../data/Transform3DFlag";
import Box = CANNON.Box;
import {PhysicsComponent} from "../../core/PhysicsComponent";

export class Body extends PhysicsComponent implements ICom {
    userData: string;
    private data: BodyData;

    OnInit() {
        this.data = JSON.parse(this.userData);
        // for (let index = 0; index < this.data.shapes.length; index++) {
        //     this.data.shapes[index] = JSON.parse(this.data.shapes[index] as any);
        // }
        if (this.mBody == null) {
            let op: CANNON.IBodyOptions = {};
            op.mass = this.data.mass;
            op.type = this.data.type;

            op.linearDamping = 0.5;
            op.material = new CANNON.Material();
            op.material.restitution = 0;
            op.material.friction = 0;
            this.mBody = new CANNON.Body(op);
            if (this.mBody.type != CANNON.Body.DYNAMIC) {
                this.mBody.collisionResponse = true;
            }
            for (let index = 0; index < this.data.shapes.length; index++) {
                const element = this.data.shapes[index];
                if (element.type == CANNON.Shape.types.BOX) {
                    let boxData: BoxShapeData = element as BoxShapeData;
                    let size: CANNON.Vec3 = new CANNON.Vec3();
                    let worldLossyScale = this.sprite3d.transform.getWorldLossyScale();
                    size.x = boxData.size.x * 0.5 * worldLossyScale.x;
                    size.y = boxData.size.y * 0.5 * worldLossyScale.y;
                    size.z = boxData.size.z * 0.5 * worldLossyScale.z;
                    let offset: CANNON.Vec3 = new CANNON.Vec3();
                    let box = new CANNON.Box(size);
                    this.Body.addShape(box, offset)
                }
            }
            if (this.show) {
                this.physicalCtrl.addBody(this);
            }
            this.updatePhysicsTransformFromRender(true);
        }
    }


    private tempV3: Laya.Vector3 = new Laya.Vector3();
    private tempQuaternion: Laya.Quaternion = new Laya.Quaternion();

    private tempCV3: CANNON.Vec3 = new CANNON.Vec3();
    private tempCQuaternion: CANNON.Quaternion = new CANNON.Quaternion();

    updatePhysicsTransformFromRender(force: boolean = false) {
        super.updatePhysicsTransformFromRender(force);

        if (force || this.tranFlag.Has(Transform3DFlag.TRANSFORM_WORLDPOSITION)) {
            this.tempCV3.set(this.sprite3d.transform.position.x, this.sprite3d.transform.position.y, this.sprite3d.transform.position.z);
            let p = this.mBody.velocity;
            p.set(this.mBody.initVelocity.x, this.mBody.initVelocity.y, this.mBody.initVelocity.z);
            this.mBody.velocity = p;
            this.mBody.position = this.tempCV3;
            this.tranFlag.Remove(Transform3DFlag.TRANSFORM_WORLDPOSITION)
        }

        if (force || this.tranFlag.Has(Transform3DFlag.TRANSFORM_WORLDQUATERNION)) {
            this.tempCQuaternion.set(this.sprite3d.transform.rotation.x, this.sprite3d.transform.rotation.y,
                this.sprite3d.transform.rotation.z, this.sprite3d.transform.rotation.w);
            this.mBody.quaternion = this.tempCQuaternion;
            this.tranFlag.Remove(Transform3DFlag.TRANSFORM_WORLDQUATERNION)
        }
        if (force || this.tranFlag.Has(Transform3DFlag.TRANSFORM_WORLDSCALE)) {
            this.setShapeScale(this.sprite3d.transform.getWorldLossyScale());
            this.tranFlag.Remove(Transform3DFlag.TRANSFORM_WORLDSCALE)
        }
        this.mBody.updateMassProperties();
        this.mBody.updateSolveMassProperties();
        // this.mBody.updateInertiaWorld(new CANNON.Vec3());

        // this.mBody.updateInertiaWorld(new CANNON.Vec3());
        // this.mBody.updateBoundingRadius()
    }

    updateTransformPhysicsComponent() {
        if (this.isValid) {
            if (this.Body.type == CANNON.Body.DYNAMIC) {
                GameUtils.SetV4(this.tempQuaternion, this.Body.quaternion);
                this.sprite3d.transform.rotation = this.tempQuaternion;
                this.tempV3.setValue(this.Body.position.x, this.Body.position.y, this.sprite3d.transform.position.z);
                this.sprite3d.transform.position = this.tempV3;
            }
        }

    }

    private setShapeScale(scale: Laya.Vector3) {
        for (let index = 0; index < this.data.shapes.length; index++) {
            const element = this.data.shapes[index];
            if (element.type == CANNON.Shape.types.BOX) {
                let boxData: BoxShapeData = element as BoxShapeData;
                let size: CANNON.Vec3 = new CANNON.Vec3();
                size.set(boxData.size.x * scale.x * 0.5, boxData.size.y * scale.y * 0.5, boxData.size.z * scale.z * 0.5);
                // size.mult(0.5);
                let offset: CANNON.Vec3 = new CANNON.Vec3();
                offset.x = boxData.size.x * scale.x * (boxData.center.x / boxData.size.x);
                offset.y = boxData.size.y * scale.y * (boxData.center.y / boxData.size.y);
                offset.z = boxData.size.z * scale.z * (boxData.center.z / boxData.size.z);
                offset.x *= -1;
                let box = this.Body.shapes[index] as Box;
                box.halfExtents = size;
                this.Body.shapeOffsets[index] = offset;

                // console.log(this.Body.shapeOffsets[index],boxData.size,size,scale);
            }
        }
        this.Body.updateBoundingRadius();

    }
}