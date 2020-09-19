import {ICom} from "../ICom"
import {BoxShapeData, BodyData} from "../../data/BodyData"
import {GameUtils} from "../../utils/GameUtils"
import {Transform3DFlag} from "../../data/Transform3DFlag"
import Box = OIMO.Box
import {PhysicsComponent} from "../../core/PhysicsComponent"

export class Body extends PhysicsComponent implements ICom {
    private data: BodyData

    onSerialization(data: string) {
        this.data = JSON.parse(data)
    }

    onInit() {

        // for (let index = 0; index < this.data.shapes.length; index++) {
        //     this.data.shapes[index] = JSON.parse(this.data.shapes[index] as any);
        // }
        if (this.mBody == null) {
            this.tempCV3.set(this.sprite3d.transform.position.x, this.sprite3d.transform.position.y, this.sprite3d.transform.position.z)
            this.tempCQuaternion.set(this.sprite3d.transform.rotation.x, this.sprite3d.transform.rotation.y,
                this.sprite3d.transform.rotation.z, this.sprite3d.transform.rotation.w)

            this.mBody = new OIMO.RigidBody(this.tempCV3, this.tempCQuaternion)
            if (this.data.type == 1) {
                // this.mBody.isDynamic = true
                this.mBody.type = OIMO.BODY_DYNAMIC
            }
            if (this.data.type == 2) {
                this.mBody.isStatic = true
                this.mBody.type = OIMO.BODY_STATIC
            }
            if (this.data.type == 4) {
                this.mBody.type = OIMO.BODY_STATIC
                this.mBody.isKinematic = true
            }
            for (let index = 0; index < this.data.shapes.length; index++) {
                const element = this.data.shapes[index]
                if (element.type == 4) {
                    let boxData: BoxShapeData = element as BoxShapeData
                    let worldLossyScale = this.sprite3d.transform.getWorldLossyScale()
                    //let offset: CANNON.Vec3 = new CANNON.Vec3()
                    let cfg = new OIMO.ShapeConfig()
                    cfg.relativeRotation = new OIMO.Mat33()
                    cfg.relativePosition = new OIMO.Vec3()
                    let box = new OIMO.Box(cfg, boxData.size.x * worldLossyScale.x, boxData.size.y * worldLossyScale.y, boxData.size.z * worldLossyScale.z)
                    this.Body.addShape(box)
                    this.Body.setupMass(this.mBody.type, true)
                }
            }
            if (this.show) {

                this.physicalCtrl.addBody(this)
            }
            this.Body.setupMass(this.mBody.type, false)
            this.updatePhysicsTransformFromRender(true)
        }
        console.log(this.sprite3d.name, this.Body.numShapes)
    }

    onAwake(): void {
        super.onAwake()

    }


    private tempV3: Laya.Vector3 = new Laya.Vector3()
    private tempQuaternion: Laya.Quaternion = new Laya.Quaternion()

    private tempCV3: OIMO.Vec3 = new OIMO.Vec3()
    private tempCQuaternion: OIMO.Quat = new OIMO.Quat()

    updatePhysicsTransformFromRender(force: boolean = false) {
        super.updatePhysicsTransformFromRender(force)

        if (force || this.tranFlag.Has(Transform3DFlag.TRANSFORM_WORLDPOSITION)) {

            this.tempCV3.set(this.sprite3d.transform.position.x, this.sprite3d.transform.position.y, this.sprite3d.transform.position.z)
            this.mBody.position.set(this.tempCV3.x, this.tempCV3.y, this.tempCV3.z)
            this.tranFlag.Remove(Transform3DFlag.TRANSFORM_WORLDPOSITION)
            this.Body.setupMass(this.Body.type, false)
        }

        if (force || this.tranFlag.Has(Transform3DFlag.TRANSFORM_WORLDQUATERNION)) {
            this.tempCQuaternion.set(this.sprite3d.transform.rotation.x, this.sprite3d.transform.rotation.y,
                this.sprite3d.transform.rotation.z, this.sprite3d.transform.rotation.w)
            this.mBody.quaternion.set(this.tempCQuaternion.x, this.tempCQuaternion.y, this.tempCQuaternion.z, this.tempCQuaternion.w)
            this.tranFlag.Remove(Transform3DFlag.TRANSFORM_WORLDQUATERNION)
            this.Body.setupMass(this.Body.type, false)
        }
        if (force || this.tranFlag.Has(Transform3DFlag.TRANSFORM_WORLDSCALE)) {
            this.setShapeScale(this.sprite3d.transform.getWorldLossyScale())
            this.tranFlag.Remove(Transform3DFlag.TRANSFORM_WORLDSCALE)
            this.Body.setupMass(this.Body.type, false)
        }

    }

    updateTransformPhysicsComponent() {
        if (this.isValid) {
            if (this.Body.isDynamic) {
                GameUtils.SetV4(this.tempQuaternion, this.Body.quaternion)
                this.sprite3d.transform.rotation = this.tempQuaternion
                this.tempV3.setValue(this.Body.position.x, this.Body.position.y, this.sprite3d.transform.position.z)
                this.sprite3d.transform.position = this.tempV3
            }
        }

    }

    private setShapeScale(scale: Laya.Vector3) {
        let shape = this.Body.shapes
        let i = 0
        while (shape) {
            const element = this.data.shapes[i]
            if (element != null) {
                if (element.type == 4) {
                    let boxData: BoxShapeData = element as BoxShapeData
                    let box = (shape as OIMO.Box)
                    box.width = boxData.size.x * scale.x
                    box.height = boxData.size.y * scale.y
                    box.depth = boxData.size.z * scale.z
                    let offset: OIMO.Vec3 = new OIMO.Vec3(-1 * (boxData.size.x * scale.x * (boxData.center.x / boxData.size.x)),
                        boxData.size.y * scale.y * (boxData.center.y / boxData.size.y),
                        boxData.size.z * scale.z * (boxData.center.z / boxData.size.z))
                    box.relativePosition = offset
                }
            }
            i++
            shape = shape.next
        }

    }
}
