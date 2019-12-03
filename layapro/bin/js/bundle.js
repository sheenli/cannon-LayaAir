(function () {
    'use strict';

    class GameConfig {
        constructor() {
        }
        static init() {
            var reg = Laya.ClassUtils.regClass;
        }
    }
    GameConfig.width = 640;
    GameConfig.height = 1136;
    GameConfig.scaleMode = "full";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class GameUtils {
        static layaV32CannonV3(pos) {
            return new CANNON.Vec3(pos.x, pos.y, pos.z);
        }
        static layaQuaternion2CanQuaternion(q) {
            return new CANNON.Quaternion(q.x, q.y, q.z, q.w);
        }
        static SetV3(pos1, pos2) {
            pos1.x = pos2.x;
            pos1.y = pos2.y;
            pos1.z = pos2.z;
        }
        static SetV4(q1, q2) {
            q1.x = q2.x;
            q1.y = q2.y;
            q1.z = q2.z;
            q1.w = q2.w;
        }
    }

    class Transform3DFlag {
    }
    Transform3DFlag.TRANSFORM_LOCALQUATERNION = 0x01;
    Transform3DFlag.TRANSFORM_LOCALEULER = 0x02;
    Transform3DFlag.TRANSFORM_LOCALMATRIX = 0x04;
    Transform3DFlag.TRANSFORM_WORLDPOSITION = 0x08;
    Transform3DFlag.TRANSFORM_WORLDQUATERNION = 0x10;
    Transform3DFlag.TRANSFORM_WORLDSCALE = 0x20;
    Transform3DFlag.TRANSFORM_WORLDMATRIX = 0x40;
    Transform3DFlag.TRANSFORM_WORLDEULER = 0x80;

    class GameFlag {
        constructor(flag = 0) {
            this.mValue = 0;
            this.mValue = flag;
        }
        get Value() {
            return this.mValue;
        }
        set Value(v) {
            this.mValue = v;
        }
        Add(flag) {
            this.mValue |= flag;
            return this;
        }
        Remove(flag) {
            this.mValue &= ~flag;
            return this;
        }
        Has(flag) {
            return (this.mValue & flag) != 0;
        }
    }

    var Event = Laya.Event;
    class PhysicsComponent extends Laya.Script3D {
        constructor() {
            super(...arguments);
            this.show = false;
            this.tranFlag = new GameFlag();
        }
        get sprite3d() {
            return this.owner;
        }
        get Body() {
            return this.mBody;
        }
        onAwake() {
            this.owner.transform.on(Event.TRANSFORM_CHANGED, this, this.onTransformChanged);
            this.physicalCtrl = GameMgr.Inst.cannonPhysicalCtrl;
            console.log("onAwake-----------");
        }
        onEnable() {
            this.show = true;
            this.physicalCtrl.addBody(this);
        }
        onDisable() {
            this.show = false;
            this.tranFlag.Value = 0;
            this.physicalCtrl.removeBody(this);
        }
        get isValid() {
            return this.show && this.mBody;
        }
        onDestroy() {
            this.owner.transform.off(Event.TRANSFORM_CHANGED, this, this.onTransformChanged);
            this.mBody = null;
        }
        onTransformChanged(flag) {
            if (PhysicsComponent.canAdd && this.isValid) {
                flag &= Transform3DFlag.TRANSFORM_WORLDSCALE | Transform3DFlag.TRANSFORM_WORLDPOSITION | Transform3DFlag.TRANSFORM_WORLDQUATERNION;
                this.tranFlag.Add(flag);
                if (this.tranFlag.Value != 0) {
                    this.physicalCtrl.addToUpdateToPyList(this);
                }
            }
        }
        updatePhysicsTransformFromRender(force = false) {
        }
        updateTransformPhysicsComponent() {
        }
    }
    PhysicsComponent.canAdd = true;

    class Body extends PhysicsComponent {
        constructor() {
            super(...arguments);
            this.tempV3 = new Laya.Vector3();
            this.tempQuaternion = new Laya.Quaternion();
            this.tempCV3 = new CANNON.Vec3();
            this.tempCQuaternion = new CANNON.Quaternion();
        }
        OnInit() {
            this.data = JSON.parse(this.userData);
            for (let index = 0; index < this.data.shapes.length; index++) {
                this.data.shapes[index] = JSON.parse(this.data.shapes[index]);
            }
            if (this.mBody == null) {
                let op = {};
                op.mass = this.data.mass;
                op.type = this.data.type;
                op.linearDamping = 0.5;
                op.material = new CANNON.Material();
                op.material.restitution = 0;
                op.material.friction = 0;
                this.mBody = new CANNON.Body(op);
                for (let index = 0; index < this.data.shapes.length; index++) {
                    const element = this.data.shapes[index];
                    if (element.type == CANNON.Shape.types.BOX) {
                        let boxData = element;
                        let size = new CANNON.Vec3();
                        let worldLossyScale = this.sprite3d.transform.getWorldLossyScale();
                        size.x = boxData.size.x * 0.5 * worldLossyScale.x;
                        size.y = boxData.size.y * 0.5 * worldLossyScale.y;
                        size.z = boxData.size.z * 0.5 * worldLossyScale.z;
                        let offset = new CANNON.Vec3();
                        offset.x = boxData.center.x;
                        offset.y = boxData.center.y;
                        offset.z = boxData.center.z;
                        let box = new CANNON.Box(size);
                        this.Body.addShape(box, offset);
                    }
                }
                if (this.show) {
                    this.physicalCtrl.addBody(this);
                }
                this.updatePhysicsTransformFromRender(true);
            }
        }
        updatePhysicsTransformFromRender(force = false) {
            super.updatePhysicsTransformFromRender(force);
            if (force || this.tranFlag.Has(Transform3DFlag.TRANSFORM_WORLDSCALE)) {
                this.setShapeScale(this.sprite3d.transform.getWorldLossyScale());
                this.tranFlag.Remove(Transform3DFlag.TRANSFORM_WORLDSCALE);
            }
            if (force || this.tranFlag.Has(Transform3DFlag.TRANSFORM_WORLDPOSITION)) {
                this.tempCV3.set(this.sprite3d.transform.position.x, this.sprite3d.transform.position.y, this.sprite3d.transform.position.z);
                let p = this.mBody.velocity;
                p.set(this.mBody.initVelocity.x, this.mBody.initVelocity.y, this.mBody.initVelocity.z);
                this.mBody.velocity = p;
                this.mBody.position = this.tempCV3;
                this.tranFlag.Remove(Transform3DFlag.TRANSFORM_WORLDPOSITION);
            }
            if (force || this.tranFlag.Has(Transform3DFlag.TRANSFORM_WORLDQUATERNION)) {
                this.tempCQuaternion.set(this.sprite3d.transform.rotation.x, this.sprite3d.transform.rotation.y, this.sprite3d.transform.rotation.z, this.sprite3d.transform.rotation.w);
                this.mBody.quaternion = this.tempCQuaternion;
                this.tranFlag.Remove(Transform3DFlag.TRANSFORM_WORLDQUATERNION);
            }
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
        setShapeScale(scale) {
            for (let index = 0; index < this.data.shapes.length; index++) {
                const element = this.data.shapes[index];
                if (element.type == CANNON.Shape.types.BOX) {
                    let boxData = element;
                    let size = new CANNON.Vec3();
                    size.set(boxData.size.x * scale.x, boxData.size.y * scale.y, boxData.size.z * scale.z);
                    size.mult(0.5);
                    let offset = new CANNON.Vec3();
                    offset.set(boxData.center.x * scale.x, boxData.center.y * scale.y, boxData.center.z * scale.z);
                    let box = this.Body.shapes[index];
                    box.halfExtents = size;
                    this.Body.shapeOffsets[index] = offset;
                }
            }
        }
    }

    var Reg = Laya.ClassUtils.regClass;
    class ComMgr {
        constructor() {
            ComMgr.Init();
        }
        static Init() {
            Reg("YK.Body", Body);
        }
        initComs(go, info) {
            this.addCom(go, info);
            this.initDatas(go, info);
        }
        addCom(go, info) {
            if (go.name != info.name) {
                console.error("文件和游戏物体不相同");
            }
            else {
                ComMgr.initCom(go, info.coms);
                for (let index = 0; index < info.childs.length; index++) {
                    const element = info.childs[index];
                    let child = go.getChildByName(element.name);
                    if (child != null) {
                        this.addCom(child, element);
                    }
                }
            }
        }
        static initCom(go, comInfos) {
            for (let index = 0; index < comInfos.length; index++) {
                let comInfo = comInfos[index];
                let com = go.addComponent(Laya.ClassUtils.getClass(comInfo.name));
                com.userData = comInfo.data;
            }
        }
        initDatas(go, info) {
            if (go.name != info.name) {
                console.error("文件和游戏物体不相同");
            }
            else {
                ComMgr.initData(go, info.coms);
                for (let index = 0; index < info.childs.length; index++) {
                    const element = info.childs[index];
                    let child = go.getChildByName(element.name);
                    if (child != null) {
                        this.initDatas(child, element);
                    }
                }
            }
        }
        static initData(go, comInfos) {
            for (let index = 0; index < comInfos.length; index++) {
                let comInfo = comInfos[index];
                let cls = Laya.ClassUtils.getClass(comInfo.name);
                let com = new cls();
                com.userData = comInfo.data;
                go.addComponentIntance(com);
                com.OnInit();
            }
        }
    }

    class GameObjectInfo {
        constructor() {
            this.coms = new Array();
            this.childs = new Array();
        }
    }
    class ComInfo {
    }

    class GameMain {
        constructor() {
            this.isDown = false;
            console.log("测试4");
            Laya.loader.create(["res/unitylib/Conventional/SampleScene.ls", "res/unitylib/Conventional/SampleScene.json"], Laya.Handler.create(this, (a) => {
                let scene = Laya.loader.getRes("res/unitylib/Conventional/SampleScene.ls");
                Laya.stage.addChild(scene);
                this.init();
                let goInfo = new GameObjectInfo();
                goInfo.name = scene.name;
                goInfo.childs = Laya.loader.getRes("res/unitylib/Conventional/SampleScene.json").objInfos;
                GameMgr.Inst.comMgr.initComs(scene, goInfo);
                this.mRoot = scene.getChildByName("TestRoot");
                Laya.stage.on(Laya.Event.MOUSE_DOWN, this, (ev) => {
                    this.isDown = true;
                    this.brgX = ev.stageX;
                    this.startR = this.mRoot.transform.localRotationEulerZ;
                });
                Laya.stage.on(Laya.Event.MOUSE_UP, this, () => {
                    this.isDown = false;
                });
                Laya.stage.on(Laya.Event.MOUSE_MOVE, this, (ev) => {
                    if (!this.isDown)
                        return;
                    const da = ev.stageX - this.brgX;
                    if (Math.abs(da) > 10) {
                        this.mRoot.transform.localRotationEulerZ = (this.startR - da * 0.3) % 360;
                    }
                });
            }));
        }
        init() {
        }
    }

    class CannonPhysicalCtrl {
        constructor() {
            this.fixedTimeStep = 1.0 / 60.0;
            this.maxSubSteps = 3;
            this.updateList = new Array();
            this.updateToPyList = new Array();
        }
        addToUpdateToPyList(com) {
            this.updateToPyList.push(com);
        }
        addBody(com) {
            let index = this.updateList.findIndex(a => a == com);
            if (index == -1 && com.Body) {
                this.world.addBody(com.Body);
                this.updateList.push(com);
            }
        }
        removeBody(com) {
            if (com.Body) {
                this.world.remove(com.Body);
                let index = this.updateList.findIndex(a => a == com);
                if (index != -1)
                    this.updateList.splice(index, 1);
            }
        }
        init() {
            Laya.timer.frameLoop(1, this, this.update, null, true);
            this.world = new CANNON.World();
            this.world.gravity.set(0, -9.82, 0);
            this.world.broadphase = new CANNON.NaiveBroadphase();
            Laya.timer.frameLoop(1, this, this.update, null, true);
        }
        update() {
            PhysicsComponent.canAdd = false;
            for (let i = 0; i < this.updateToPyList.length; i++) {
                this.updateToPyList.pop().updatePhysicsTransformFromRender();
            }
            this.world.step(this.fixedTimeStep);
            for (let i = 0; i < this.updateList.length; i++) {
                this.updateList[i].updateTransformPhysicsComponent();
            }
            PhysicsComponent.canAdd = true;
        }
    }

    class GameMgr {
        constructor() {
            GameMgr.mInst = this;
        }
        static get Inst() {
            if (this.mInst == null)
                new GameMgr();
            return this.mInst;
        }
        init() {
            this.comMgr = new ComMgr();
            this.cannonPhysicalCtrl = new CannonPhysicalCtrl();
            this.cannonPhysicalCtrl.init();
            new GameMain();
        }
    }

    class Main {
        constructor() {
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError = true;
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            GameMgr.Inst.init();
        }
    }
    new Main();

}());
