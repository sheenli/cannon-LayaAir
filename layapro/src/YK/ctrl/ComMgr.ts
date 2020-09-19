import {GameObjectInfo, ComInfo} from "../coms/GamObjectInfo";
import {Body} from "./../coms/physical/Body";
import {ICom} from "../coms/ICom";

const Reg = Laya.ClassUtils.regClass;

export class ComMgr {
    constructor() {
        ComMgr.Init();
    }

    private static Init() {
        Reg("YK.Body", Body)
    }

    static RegClass(name,cls){
        Reg(name,cls);
    }


    initComs(go: Laya.Sprite3D, info: GameObjectInfo) {
        this.addCom(go, info);
        this.initDatas(go, info);
    }

    private addCom(go: Laya.Sprite3D, info: GameObjectInfo) {
        if (go.name != info.name) {
            console.error("文件和游戏物体不相同");
        } else {
            ComMgr.initCom(go, info.coms);
            for (let index = 0; index < info.childs.length; index++) {
                let element = info.childs[index];
                let child = go.getChildAt(element.instanceID) as Laya.Sprite3D;
                if (child != null) {
                    this.addCom(child, element);
                }
            }
        }
    }

    private static initCom(go: Laya.Sprite3D, comInfos: Array<ComInfo>) {
        for (let index = 0; index < comInfos.length; index++) {
            let comInfo = comInfos[index];
            let cls = Laya.ClassUtils.getClass(comInfo.name);
            if (cls == null) {
                console.error("无法绑定组件检查是否注册 组件名称：" + comInfo.name);
                continue;
            }
            let com = go.addComponent(cls) as ICom;
            com.onSerialization(comInfo.data);
        }

    }

    private initDatas(go: Laya.Sprite3D, info: GameObjectInfo) {
        if (go.name != info.name) {
            console.error("文件和游戏物体不相同");
        } else {
            ComMgr.initData(go, info.coms);
            for (let index = 0; index < info.childs.length; index++) {
                const element = info.childs[index];
                let child = go.getChildAt(element.instanceID) as Laya.Sprite3D;
                if (child != null) {
                    this.initDatas(child, element);
                }
            }
        }
    }

    private static initData(go: Laya.Sprite3D, comInfos: Array<ComInfo>) {
        for (let index = 0; index < comInfos.length; index++) {
            let comInfo = comInfos[index];
            let cls = Laya.ClassUtils.getClass(comInfo.name);
            let com = go.getComponent(cls);
            com.onInit();
        }

    }
}
