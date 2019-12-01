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

    class Body extends Laya.Script {
        constructor() {
            super(...arguments);
            this.tempV3 = new Laya.Vector3();
            this.tempQuaternion = new Laya.Quaternion();
            this.tempCV3 = new CANNON.Vec3();
            this.tempCQuaternion = new CANNON.Quaternion();
        }
        get Body() {
            return this.mbody;
        }
        OnInit() {
            this.mSp = this.owner;
            this.data = JSON.parse(this.userData);
            for (let index = 0; index < this.data.shapes.length; index++) {
                this.data.shapes[index] = JSON.parse(this.data.shapes[index]);
            }
            this.pyWorld = GameMgr.Inst.world;
            if (this.mbody == null) {
                let op = {};
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
                        let boxData = element;
                        let size = new CANNON.Vec3();
                        size.x = boxData.size.x * 0.5 * this.mSp.transform.scale.x;
                        size.y = boxData.size.y * 0.5 * this.mSp.transform.scale.y;
                        size.z = boxData.size.z * 0.5 * this.mSp.transform.scale.z;
                        let offset = new CANNON.Vec3();
                        offset.x = boxData.center.x;
                        offset.y = boxData.center.y;
                        offset.z = boxData.center.z;
                        let box = new CANNON.Box(size);
                        this.Body.addShape(box, offset);
                    }
                }
            }
        }
        onDestroy() {
            if (this.mbody != null)
                this.pyWorld.removeBody(this.mbody);
        }
        onUpdate() {
            if (this.mbody == null)
                return;
            if (this.mbody.type == CANNON.Body.DYNAMIC) {
                this.tempV3.setValue(this.mbody.position.x, this.mbody.position.y, this.mbody.position.z);
                this.mSp.transform.position = this.tempV3;
                GameUtils.SetV4(this.tempQuaternion, this.mbody.quaternion);
                this.mSp.transform.rotation = this.tempQuaternion;
            }
            else {
                this.tempCV3.set(this.mSp.transform.position.x, this.mSp.transform.position.y, this.mSp.transform.position.z);
                this.tempCQuaternion.set(this.mSp.transform.rotation.x, this.mSp.transform.rotation.y, this.mSp.transform.rotation.z, this.mSp.transform.rotation.w);
                this.mbody.position = this.tempCV3;
                this.mbody.quaternion = this.tempCQuaternion;
            }
        }
        updateTran() {
        }
    }

    var Reg = Laya.ClassUtils.regClass;
    class ComMgr {
        constructor() {
            this.Init();
        }
        Init() {
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
                this.initCom(go, info.coms);
                for (let index = 0; index < info.childs.length; index++) {
                    const element = info.childs[index];
                    let child = go.getChildByName(element.name);
                    if (child != null) {
                        this.addCom(child, element);
                    }
                }
            }
        }
        initCom(go, comInfos) {
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
                this.initData(go, info.coms);
                for (let index = 0; index < info.childs.length; index++) {
                    const element = info.childs[index];
                    let child = go.getChildByName(element.name);
                    if (child != null) {
                        this.initDatas(child, element);
                    }
                }
            }
        }
        initData(go, comInfos) {
            for (let index = 0; index < comInfos.length; index++) {
                let comInfo = comInfos[index];
                let com = go.getComponent(Laya.ClassUtils.getClass(comInfo.name));
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
            Laya.loader.create(["res/unitylib/Conventional/SampleScene.ls", "res/unitylib/Conventional/SampleScene.json"], Laya.Handler.create(this, (a) => {
                let scene = Laya.loader.getRes("res/unitylib/Conventional/SampleScene.ls");
                Laya.stage.addChild(scene);
                this.Plane = scene.getChildByName("Plane");
                this.Cube = scene.getChildByName("Cube");
                this.init();
                let goInfo = new GameObjectInfo();
                goInfo.name = scene.name;
                goInfo.childs = Laya.loader.getRes("res/unitylib/Conventional/SampleScene.json").objInfos;
                GameMgr.Inst.comMgr.initComs(scene, goInfo);
            }));
        }
        init() {
        }
    }

    class GameMgr {
        constructor() {
            this.fixedTimeStep = 1.0 / 60.0;
            this.maxSubSteps = 3;
            GameMgr.mInst = this;
        }
        static get Inst() {
            if (this.mInst == null)
                new GameMgr();
            return this.mInst;
        }
        init() {
            this.comMgr = new ComMgr();
            Laya.timer.frameLoop(1, this, this.update, null, true);
            this.world = new CANNON.World();
            this.world.gravity.set(0, -0.982, 0);
            this.world.broadphase = new CANNON.NaiveBroadphase();
            Laya.timer.frameLoop(1, this, this.update, null, true);
            new GameMain();
        }
        update() {
            this.world.step(this.fixedTimeStep, Laya.timer.delta, this.maxSubSteps);
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
