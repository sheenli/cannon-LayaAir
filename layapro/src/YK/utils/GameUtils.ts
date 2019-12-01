export class GameUtils {
    static layaV32CannonV3(pos: Laya.Vector3) {
        return new CANNON.Vec3(pos.x, pos.y, pos.z);
    }
    static layaQuaternion2CanQuaternion(q: Laya.Quaternion) {
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