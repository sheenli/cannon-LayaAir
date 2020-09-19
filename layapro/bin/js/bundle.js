(function () {
    'use strict';

    class GameConfig {
        constructor() { }
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
            return this.show && this.mBody != null;
        }
        onDestroy() {
            this.owner.transform.off(Event.TRANSFORM_CHANGED, this, this.onTransformChanged);
            this.physicalCtrl.removeBody(this);
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
            this.tempCV3 = new OIMO.Vec3();
            this.tempCQuaternion = new OIMO.Quat();
        }
        onSerialization(data) {
            this.data = JSON.parse(data);
        }
        onInit() {
            if (this.mBody == null) {
                this.tempCV3.set(this.sprite3d.transform.position.x, this.sprite3d.transform.position.y, this.sprite3d.transform.position.z);
                this.tempCQuaternion.set(this.sprite3d.transform.rotation.x, this.sprite3d.transform.rotation.y, this.sprite3d.transform.rotation.z, this.sprite3d.transform.rotation.w);
                this.mBody = new OIMO.RigidBody(this.tempCV3, this.tempCQuaternion);
                if (this.data.type == 1) {
                    this.mBody.type = OIMO.BODY_DYNAMIC;
                }
                if (this.data.type == 2) {
                    this.mBody.isStatic = true;
                    this.mBody.type = OIMO.BODY_STATIC;
                }
                if (this.data.type == 4) {
                    this.mBody.type = OIMO.BODY_STATIC;
                    this.mBody.isKinematic = true;
                }
                for (let index = 0; index < this.data.shapes.length; index++) {
                    const element = this.data.shapes[index];
                    if (element.type == 4) {
                        let boxData = element;
                        let worldLossyScale = this.sprite3d.transform.getWorldLossyScale();
                        let cfg = new OIMO.ShapeConfig();
                        cfg.relativeRotation = new OIMO.Mat33();
                        cfg.relativePosition = new OIMO.Vec3();
                        let box = new OIMO.Box(cfg, boxData.size.x * worldLossyScale.x, boxData.size.y * worldLossyScale.y, boxData.size.z * worldLossyScale.z);
                        this.Body.addShape(box);
                        this.Body.setupMass(this.mBody.type, true);
                    }
                }
                if (this.show) {
                    this.physicalCtrl.addBody(this);
                }
                this.Body.setupMass(this.mBody.type, false);
                this.updatePhysicsTransformFromRender(true);
            }
            console.log(this.sprite3d.name, this.Body.numShapes);
        }
        onAwake() {
            super.onAwake();
        }
        updatePhysicsTransformFromRender(force = false) {
            super.updatePhysicsTransformFromRender(force);
            if (force || this.tranFlag.Has(Transform3DFlag.TRANSFORM_WORLDPOSITION)) {
                this.tempCV3.set(this.sprite3d.transform.position.x, this.sprite3d.transform.position.y, this.sprite3d.transform.position.z);
                this.mBody.position.set(this.tempCV3.x, this.tempCV3.y, this.tempCV3.z);
                this.tranFlag.Remove(Transform3DFlag.TRANSFORM_WORLDPOSITION);
                this.Body.setupMass(this.Body.type, false);
            }
            if (force || this.tranFlag.Has(Transform3DFlag.TRANSFORM_WORLDQUATERNION)) {
                this.tempCQuaternion.set(this.sprite3d.transform.rotation.x, this.sprite3d.transform.rotation.y, this.sprite3d.transform.rotation.z, this.sprite3d.transform.rotation.w);
                this.mBody.quaternion.set(this.tempCQuaternion.x, this.tempCQuaternion.y, this.tempCQuaternion.z, this.tempCQuaternion.w);
                this.tranFlag.Remove(Transform3DFlag.TRANSFORM_WORLDQUATERNION);
                this.Body.setupMass(this.Body.type, false);
            }
            if (force || this.tranFlag.Has(Transform3DFlag.TRANSFORM_WORLDSCALE)) {
                this.setShapeScale(this.sprite3d.transform.getWorldLossyScale());
                this.tranFlag.Remove(Transform3DFlag.TRANSFORM_WORLDSCALE);
                this.Body.setupMass(this.Body.type, false);
            }
        }
        updateTransformPhysicsComponent() {
            if (this.isValid) {
                if (this.Body.isDynamic) {
                    GameUtils.SetV4(this.tempQuaternion, this.Body.quaternion);
                    this.sprite3d.transform.rotation = this.tempQuaternion;
                    this.tempV3.setValue(this.Body.position.x, this.Body.position.y, this.sprite3d.transform.position.z);
                    this.sprite3d.transform.position = this.tempV3;
                }
            }
        }
        setShapeScale(scale) {
            let shape = this.Body.shapes;
            let i = 0;
            while (shape) {
                const element = this.data.shapes[i];
                if (element != null) {
                    if (element.type == 4) {
                        let boxData = element;
                        let box = shape;
                        box.width = boxData.size.x * scale.x;
                        box.height = boxData.size.y * scale.y;
                        box.depth = boxData.size.z * scale.z;
                        let offset = new OIMO.Vec3(-1 * (boxData.size.x * scale.x * (boxData.center.x / boxData.size.x)), boxData.size.y * scale.y * (boxData.center.y / boxData.size.y), boxData.size.z * scale.z * (boxData.center.z / boxData.size.z));
                        box.relativePosition = offset;
                    }
                }
                i++;
                shape = shape.next;
            }
        }
    }

    const Reg = Laya.ClassUtils.regClass;
    class ComMgr {
        constructor() {
            ComMgr.Init();
        }
        static Init() {
            Reg("YK.Body", Body);
        }
        static RegClass(name, cls) {
            Reg(name, cls);
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
                    let element = info.childs[index];
                    let child = go.getChildAt(element.instanceID);
                    if (child != null) {
                        this.addCom(child, element);
                    }
                }
            }
        }
        static initCom(go, comInfos) {
            for (let index = 0; index < comInfos.length; index++) {
                let comInfo = comInfos[index];
                let cls = Laya.ClassUtils.getClass(comInfo.name);
                if (cls == null) {
                    console.error("无法绑定组件检查是否注册 组件名称：" + comInfo.name);
                    continue;
                }
                let com = go.addComponent(cls);
                com.onSerialization(comInfo.data);
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
                    let child = go.getChildAt(element.instanceID);
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
                let com = go.getComponent(cls);
                com.onInit();
            }
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
                this.world.addRigidBody(com.Body);
                this.updateList.push(com);
            }
        }
        removeBody(com) {
            if (com.Body) {
                this.world.removeRigidBody(com.Body);
                let index = this.updateList.findIndex(a => a == com);
                if (index != -1)
                    this.updateList.splice(index, 1);
            }
        }
        init() {
            this.world = new OIMO.World({
                timestep: 1 / 60,
                iterations: 8,
                broadphase: 2,
                worldscale: 1,
                random: true,
                info: false,
                gravity: [0, -10, 0]
            });
            Laya.timer.frameLoop(1, this, this.update, null, true);
        }
        update() {
            PhysicsComponent.canAdd = false;
            for (let i = 0; i < this.updateToPyList.length; i++) {
                this.updateToPyList.pop().updatePhysicsTransformFromRender();
            }
            this.world.step();
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
            Laya.loader.create(["res/unitylib/Conventional/SampleScene.ls",
                "res/unitylib/Conventional/SampleScene.json",
                "res/unitylib/Conventional/original.lh",
                "res/unitylib/Conventional/original.json"
            ], Laya.Handler.create(this, (a) => {
                let scene = Laya.loader.getRes("res/unitylib/Conventional/SampleScene.ls");
                Laya.stage.addChild(scene);
                let goInfo = new GameObjectInfo();
                goInfo.name = scene.name;
                goInfo.childs = Laya.loader.getRes("res/unitylib/Conventional/SampleScene.json").objInfos;
                GameMgr.Inst.comMgr.initComs(scene, goInfo);
                this.mRoot = scene.getChildByName("Root");
                this.mTest = scene.getChildByName("Root");
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
                this.init();
            }));
        }
        static random(m, n) {
            let num = Math.floor(Math.random() * (m - n) + n);
            return num;
        }
        init() {
            let original = Laya.loader.getRes("res/unitylib/Conventional/original.lh");
            for (let i = 0; i < GameMain.CUBENUM; i++) {
                let gameInfo = Laya.loader.getRes("res/unitylib/Conventional/original.json");
                let cube = original.clone();
                this.mTest.addChild(cube);
                cube.transform.localPositionY = GameMain.random(3, 15);
                cube.transform.localPositionX = GameMain.random(-20, 20);
                cube.transform.localPositionZ = GameMain.random(-20, 20);
                GameMgr.Inst.comMgr.initComs(cube, gameInfo);
            }
        }
    }
    GameMain.CUBENUM = 200;

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
            new GameMain();
        }
    }
    new Main();

}());
